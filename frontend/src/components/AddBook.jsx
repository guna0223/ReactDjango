import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { bookAPI } from "../api";
import Loading from "./Loading";

function AddBook() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    price: "",
    published_date: "",
  });

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
    setLoading(true);
    setError(null);

    try {
      // Convert price to number
      const bookData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      await bookAPI.createBook(bookData);
      // Redirect to book list on success
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <Loading message="Creating book..." />;
  }

  return (
    <div className="add-book">
      <div className="page-header">
        <h2>➕ Add New Book</h2>
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
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Book"}
          </button>
          <Link to="/" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AddBook;
