import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BookList from "./components/BookList";
import AddBook from "./components/AddBook";
import EditBook from "./components/EditBook";
import BookDetail from "./components/BookDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Route for displaying all books */}
            <Route path="/" element={<BookList />} />

            {/* Route for adding a new book */}
            <Route path="/add" element={<AddBook />} />

            {/* Route for editing an existing book */}
            <Route path="/edit/:id" element={<EditBook />} />

            {/* Route for viewing book details */}
            <Route path="/books/:id" element={<BookDetail />} />

            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 404 - Not Found route */}
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h2>❌ 404 - Page Not Found</h2>
                  <p>The page you're looking for doesn't exist.</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
