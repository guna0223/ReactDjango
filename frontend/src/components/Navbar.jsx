import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authAPI } from "../api";
import { AUTH_CHANGE_EVENT } from "./Register";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for logged in user on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Listen for auth change events
    const handleAuthChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">📚 Book Manager</Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">
          All Books
        </Link>
        <Link to="/add" className="nav-link">
          Add Book
        </Link>
        {user ? (
          <div className="auth-links">
            <span className="user-greeting">Hello, {user.username}</span>
            <button onClick={handleLogout} className="nav-link btn-logout">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
