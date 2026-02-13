import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { bookAPI } from "../api";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch book details on component mount
  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookAPI.getBookById(id);
      setBook(data);
    } catch (err) {
      setError(err.message || "Failed to fetch book details");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <Loading message="Loading book details..." />;
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBook} />;
  }

  // Book not found
  if (!book) {
    return (
      <div className="not-found">
        <h2>❌ Book Not Found</h2>
        <p>The book you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to All Books
        </Link>
      </div>
    );
  }

  return (
    <div className="book-detail">
      <div className="page-header">
        <h2>📖 Book Details</h2>
        <div className="header-actions">
          <Link to="/" className="btn btn-secondary">
            ← Back to List
          </Link>
          <Link to={`/edit/${book.id}`} className="btn btn-edit">
            ✏️ Edit
          </Link>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <h3>{book.title}</h3>
          <span className="book-id">ID: {book.id}</span>
        </div>

        <div className="detail-content">
          <div className="detail-row">
            <strong>Author:</strong>
            <span>{book.author}</span>
          </div>

          <div className="detail-row">
            <strong>Price:</strong>
            <span className="price">${book.price}</span>
          </div>

          <div className="detail-row">
            <strong>Published Date:</strong>
            <span>
              {new Date(book.published_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetail;
