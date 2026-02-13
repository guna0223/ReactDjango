import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookAPI } from "../api";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookAPI.getAllBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message || "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      await bookAPI.deleteBook(id);
      // Refresh the book list after deletion
      setBooks(books.filter((book) => book.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete book");
    }
  };

  // Loading state
  if (loading) {
    return <Loading message="Fetching books..." />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBooks} />;
  }

  // Empty state
  if (books.length === 0) {
    return (
      <div className="empty-state">
        <h2>📚 No Books Found</h2>
        <p>There are no books in the database yet.</p>
        <Link to="/add" className="btn btn-primary">
          Add Your First Book
        </Link>
      </div>
    );
  }

  return (
    <div className="book-list">
      <div className="page-header">
        <h2>📚 All Books ({books.length})</h2>
        <Link to="/add" className="btn btn-primary">
          + Add New Book
        </Link>
      </div>

      <div className="books-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="author">by {book.author}</p>
              <p className="price">${book.price}</p>
              <p className="date">
                Published:{" "}
                {new Date(book.published_date).toLocaleDateString()}
              </p>
            </div>
            <div className="book-actions">
              <Link to={`/books/${book.id}`} className="btn btn-view">
                View
              </Link>
              <Link to={`/edit/${book.id}`} className="btn btn-edit">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(book.id)}
                className="btn btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookList;
