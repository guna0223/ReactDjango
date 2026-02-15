# Book Management Application

A full-stack web application for managing books with Django REST Framework backend and React frontend.

## 🏗️ Architecture Overview

This application uses a **Client-Server architecture** with the following components:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                       │
│                    Running on: http://localhost:5173                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Requests (via Vite Proxy)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Django REST API)                      │
│                    Running on: http://localhost:8000                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE (SQLite)                           │
│                    File: bookproject/db.sqlite3                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔌 How Frontend and Backend Connect

### Connection Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  React App   │────▶│  Vite Dev    │
│  (User)      │◀────│  (Frontend)  │◀────│  Server      │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                        ┌────────────────────────┘
                        │ Proxy Configuration
                        │ (vite.config.js)
                        ▼
                  ┌──────────────┐     ┌──────────────┐
                  │   Django     │────▶│   Database   │
                  │   Backend    │◀────│   (SQLite)   │
                  └──────────────┘     └──────────────┘
```

### Step-by-Step Connection Flow

#### 1. **Request Initiation**
When a user clicks a button in the React app (e.g., "Add Book"), the following happens:

```javascript
// Example from AddBook.jsx
const handleSubmit = async (bookData) => {
  await bookAPI.createBook(bookData);  // ← API call starts here
};
```

#### 2. **Axios Intercepts the Request**
The [`frontend/src/api.js`](frontend/src/api.js) file creates an Axios instance:

```javascript
const api = axios.create({
  baseURL: "/api/",           // Relative path - goes through Vite proxy
  withCredentials: true,      // Enables session cookies
});
```

#### 3. **Vite Proxy Routes the Request**
The [`vite.config.js`](frontend/vite.config.js) configures a proxy:

```javascript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',  // Forwards to Django
    changeOrigin: true
  }
}
```

**Why use a proxy?**
- Avoids CORS (Cross-Origin Resource Sharing) issues
- Makes API calls appear to come from the same origin
- Simplifies the frontend code (no full URLs needed)

#### 4. **Django Receives the Request**
The request hits Django's URL routing in [`bookproject/urls.py`](bookproject/bookproject/urls.py):

```python
urlpatterns = [
    path('api/', include('books.urls')),  # Routes to books app
]
```

#### 5. **URL Routing to Views**
The [`books/urls.py`](bookproject/books/urls.py) maps URLs to view functions:

```python
urlpatterns = [
    path('books/', BookListCreateView.as_view(), name='book-list-create'),
    path('books/<int:pk>/', BookDetailView.as_view(), name='book-detail'),
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
]
```

#### 6. **View Processes the Request**
The [`views.py`](bookproject/books/views.py) handles the logic:

```python
class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
```

#### 7. **Serializer Validates Data**
The [`serializers.py`](bookproject/books/serializers.py) converts data:

```python
class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'price', 'published_date']
```

#### 8. **Database Interaction**
Django ORM queries the SQLite database:

```python
# Internal Django process
Book.objects.all()  # SELECT * FROM books_book
```

#### 9. **Response Flow Back**
```
Database ──▶ Serializer ──▶ View ──▶ Django Server ──▶ Vite Proxy ──▶ React App
```

#### 10. **React Updates UI**
The component receives the data and updates the state:

```javascript
const fetchBooks = async () => {
  const data = await bookAPI.getAllBooks();  // Gets response
  setBooks(data);                            // Updates state
  // React re-renders the component
};
```

## 📊 Detailed Data Flow Examples

### Example 1: Fetching All Books

```
User Action: Visit homepage "/" → BookList component loads

1. BookList.jsx mounts
   └─▶ useEffect(() => { fetchBooks(); }, []) fires

2. fetchBooks() calls bookAPI.getAllBooks()
   └─▶ api.get("books/") → GET /api/books/

3. Vite proxy catches /api/books/
   └─▶ Forwards to http://127.0.0.1:8000/api/books/

4. Django URL routing
   └─▶ /api/ → books.urls → /books/ → BookListCreateView

5. BookListCreateView processes GET request
   └─▶ queryset = Book.objects.all() → [Book objects]

6. BookSerializer converts to JSON
   └─▶ [{"id":1,"title":"Django for Beginners","author":"John","price":"29.99","published_date":"2024-01-15"},...]

7. Response travels back through the chain
   └─▶ Django → Vite Proxy → Axios → fetchBooks()

8. React updates state and re-renders
   └─▶ setBooks(data) → UI shows book list
```

### Example 2: Creating a New Book

```
User Action: Fill form and click "Add Book"

1. AddBook.jsx form submit
   └─▶ handleSubmit(event) → preventDefault()

2. Prepare book data
   └─▶ { title: "New Book", author: "Jane", price: 19.99, published_date: "2024-06-01" }

3. Call API
   └─▶ bookAPI.createBook(bookData) → POST /api/books/

4. Django processes
   └─▶ BookListCreateView.post() → serializer.is_valid() → serializer.save()

5. Database operation
   └─▶ INSERT INTO books_book (title, author, price, published_date) VALUES (...)

6. Response
   └─▶ {"id":5,"title":"New Book","author":"Jane","price":"19.99","published_date":"2024-06-01"}

7. React navigates
   └─▶ navigate('/') → BookList refreshes
```

### Example 3: User Authentication

```
Registration Flow:
1. User fills Register.jsx form
2. POST /api/auth/register/ with user data
3. RegisterView creates User in database
4. Returns success message with user data
5. User stored in localStorage

Login Flow:
1. User fills Login.jsx form
2. POST /api/auth/login/ with credentials
3. LoginView validates with Django's authenticate()
4. login(request, user) creates Django session
5. Session cookie set in browser (withCredentials: true)
6. User data stored in localStorage

Session Persistence:
1. Every subsequent request includes session cookie
2. Django identifies user from session
3. CurrentUserView returns authenticated user info
```

## 🔐 Authentication Flow (Session-Based)

This application uses **Django Session Authentication**:

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

LOGIN:
┌────────┐    POST /api/auth/login    ┌─────────┐    Validate    ┌────────┐
│ React  │ ─────────────────────────▶ │ Django  │ ──────────────▶ │  DB    │
└────────┘                            └─────────┘                └────────┘
     │                                      │                         │
     │         Set-Cookie: sessionid       │                         │
     ◀─────────────────────────────────────┘                         │
     │                                                                   │
     │         Store user in localStorage                              │
     ▼                                                                   ▼
┌────────┐                           ┌─────────────────────────────┐
│ Browser│                           │ Subsequent requests include │
│ Cookie │                           │ Cookie automatically        │
└────────┘                           └─────────────────────────────┘

SUBSEQUENT REQUESTS:
┌────────┐    GET /api/books/        ┌─────────┐    Read Session    ┌────────┐
│ React  │ ─────────────────────────▶ │ Django  │ ──────────────────▶ │  DB    │
└────────┘  Cookie: sessionid=...    └─────────┘                     └────────┘
     │                                      │                         │
     ◀─────────────────────────────────────┘                         │
     │            Books data                 │                         │
     ▼                                        ▼                         ▼
```

## 📡 API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/api/books/` | List all books | - |
| POST | `/api/books/` | Create new book | `{"title","author","price","published_date"}` |
| GET | `/api/books/{id}/` | Get single book | - |
| PUT | `/api/books/{id}/` | Update book (full) | `{"title","author","price","published_date"}` |
| PATCH | `/api/books/{id}/` | Update book (partial) | `{"title":"New Title"}` |
| DELETE | `/api/books/{id}/` | Delete book | - |
| POST | `/api/auth/register/` | Register user | `{"username","email","password","password_confirm"}` |
| POST | `/api/auth/login/` | Login user | `{"username","password"}` |
| POST | `/api/auth/logout/` | Logout user | - |
| GET | `/api/auth/me/` | Get current user | - |

## 🛠️ Technology Stack

### Backend
- **Django 6.0** - Python web framework
- **Django REST Framework** - Building APIs
- **SQLite** - Lightweight database
- **CORS Headers** - Cross-origin support

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 🚀 Running the Application

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Setup Backend

```bash
# Navigate to backend directory
cd bookproject

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Django server
python manage.py runserver
```

### Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## 📁 Project Structure

```
book/
├── bookproject/              # Django project folder
│   ├── bookproject/          # Main Django app
│   │   ├── settings.py       # Django settings (CORS, REST_FRAMEWORK)
│   │   ├── urls.py           # Main URL routing
│   │   └── wsgi.py           # WSGI config
│   ├── books/                # Books app
│   │   ├── models.py         # Book model
│   │   ├── serializers.py    # DRF serializers
│   │   ├── views.py          # API views
│   │   └── urls.py           # App URL routing
│   └── db.sqlite3            # SQLite database
│
└── frontend/                 # React application
    ├── src/
    │   ├── api.js            # Axios configuration & API methods
    │   ├── App.jsx           # Main app with routes
    │   └── components/      # React components
    │       ├── BookList.jsx
    │       ├── AddBook.jsx
    │       ├── EditBook.jsx
    │       ├── BookDetail.jsx
    │       ├── Login.jsx
    │       └── Register.jsx
    └── vite.config.js        # Vite config with proxy
```

## 🔄 Request/Response Cycle Summary

```
┌────────────────────────────────────────────────────────────────────┐
│                      COMPLETE REQUEST CYCLE                        │
└────────────────────────────────────────────────────────────────────┘

   ┌─────────┐
   │ BROWSER │  User interacts with React UI
   └────┬────┘
        │ 1. Event handler triggers
        ▼
   ┌─────────────┐
   │ React State │  setBooks(), setLoading(), etc.
   └──────┬──────┘
        │ 2. API call initiated
        ▼
   ┌──────────┐
   │  Axios   │  Interceptors run, headers added
   └────┬─────┘
        │ 3. Request sent to /api/...
        ▼
   ┌───────────┐     ┌──────────────────┐
   │   Vite    │────▶│  Proxy forwards  │
   │   Proxy   │     │  to Django :8000 │
   └───────────┘     └────────┬─────────┘
                               │ 4. Django receives
                               ▼
   ┌───────────┐     ┌──────────────────┐
   │    URL    │────▶│  Route to view   │
   │  Router   │     │  BookListCreate  │
   └───────────┘     └────────┬─────────┘
                               │ 5. View processes
                               ▼
   ┌────────────┐    ┌──────────────────┐
   │ Serializer │◀───│  Validate data   │
   └─────┬──────┘    └────────┬─────────┘
         │ 6. Transform       │
         ▼                    ▼
   ┌──────────┐     ┌──────────────────┐
   │   Django  │────▶│  Database Query  │
   │    ORM    │     │  (SQLite)        │
   └─────┬─────┘     └────────┬─────────┘
         │ 7. Query executes  │
         ▼                    ▼
   ┌──────────┐     ┌──────────────────┐
   │ Response │◀────│  Serialize JSON   │
   │  (JSON)  │     │  Back to client   │
   └────┬─────┘     └──────────────────┘
        │ 8. Response flows back
        ▼
   ┌──────────┐
   │   Axios  │  Response interceptor
   └────┬─────┘
        │ 9. Data returned to caller
        ▼
   ┌──────────┐
   │  React   │  State updated, UI re-renders
   │  Component│
   └──────────┘
        │ 10. User sees updated UI
        ▼
   ┌─────────┐
   │ BROWSER │  Updated page displayed
   └─────────┘
```

## 🎯 Key Takeaways

1. **Vite Proxy** acts as a bridge between frontend and backend, handling CORS
2. **Django REST Framework** provides ready-made API views and serialization
3. **Session Authentication** uses cookies for persistent login state
4. **React State Management** triggers re-renders when data arrives
5. ** serializers.py** handle conversion between Python objects and JSON
6. **views.py** contain the business logic for each endpoint
7. **urls.py** map HTTP requests to appropriate view functions

---

Built with ❤️ using Django + React
