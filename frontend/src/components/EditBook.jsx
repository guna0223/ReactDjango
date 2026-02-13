import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookAPI } from "../api";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    published_date: "",
  });

  // Fetch book data on component mount
  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const book = await bookAPI.getBookById(id);
      setFormData({
        title: book.title,
        author: book.author,
        price: book.price.toString(),
        published_date: book.published_date,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch book details");
    } finally {
      setLoading(false);
    }
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Convert price to number
      const bookData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      await bookAPI.updateBook(id, bookData);
      // Redirect to book list on success
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to update book. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return <Loading message="Loading book details..." />;
  }

  // Error state
  if (error && !formData.title) {
    return <ErrorMessage message={error} onRetry={fetchBook} />;
  }

  return (
    <div className="edit-book">
      <div className="page-header">
        <h2>✏️ Edit Book</h2>
        <Link to="/" className="btn btn-secondary">
          ← Back to List
        </Link>
      </div>

      {error && (
        <div className="error-banner">
          <p>❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter book title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Enter author name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="published_date">Published Date *</label>
          <input
            type="date"
            id="published_date"
            name="published_date"
            value={formData.published_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Book"}
          </button>
          <Link to="/" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default EditBook;
