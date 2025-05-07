import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <div className="navbar-container">
      {/* Top navigation bar */}
      <nav className="navbar-top">
        <div className="navbar-global">
          <div className="navbar-logo">
            <Link to="/">Game Hub</Link>
          </div>
          <div className="global-links">
            <Link to="/" className="global-link">
              Store
            </Link>
            <Link to="/library" className="global-link">
              Library
            </Link>
            <Link to="/community" className="global-link">
              Community
            </Link>
            <Link to="/profile" className="global-link">
              Profile
            </Link>
          </div>
        </div>
        <div className="navbar-actions">
          <div className="notification-icon">
            <span className="icon">🔔</span>
          </div>
          <div className="user-menu">
            <span className="username">User</span>
            <span className="dropdown-arrow">▼</span>
          </div>
        </div>
      </nav>

      {/* Store navigation */}
      <nav className="navbar-store">
        <div className="store-nav-links">
          <Link to="/" className="store-link">
            Your Store
          </Link>
          <Link to="/new" className="store-link">
            New & Noteworthy
          </Link>
          <Link to="/categories" className="store-link">
            Categories
          </Link>
          <Link to="/points" className="store-link">
            Points Shop
          </Link>
          <Link to="/news" className="store-link">
            News
          </Link>
          <Link to="/labs" className="store-link">
            Labs
          </Link>
        </div>
        <form className="search-container" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </form>
      </nav>
    </div>
  );
};

export default Navbar;
