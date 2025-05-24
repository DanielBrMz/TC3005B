import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Search, X } from "lucide-react";
import { searchGames } from "../services/gameService";
import type { Game } from "../types/game";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Game[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search function to prevent too many API calls
  const performSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const response = await searchGames(query, 1, 6); // Get only 6 suggestions
      setSearchSuggestions(response.results);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
      setSearchSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300); // 300ms delay
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchSuggestions.length) {
          // Navigate to selected game
          const selectedGame = searchSuggestions[selectedIndex];
          navigate(`/game/${selectedGame.id}`);
          clearSearch();
        } else {
          // Navigate to search page with current query
          handleSearchSubmit(e);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle form submission or search icon click
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      clearSearch();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (game: Game) => {
    navigate(`/game/${game.id}`);
    clearSearch();
  };

  // Clear search state
  const clearSearch = () => {
    setSearchQuery("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle clear button click
  const handleClearClick = () => {
    setSearchQuery("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
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
            <Bell size={18} />
          </div>
          <div className="user-menu">
            <span className="username">User</span>
            <ChevronDown size={14} />
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

        {/* Enhanced search container with autocomplete */}
        <div className="search-container" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                placeholder="search games..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() =>
                  searchQuery.length >= 2 && setShowSuggestions(true)
                }
                className="search-input"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearClick}
                  className="clear-search-button"
                >
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="search-button">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Search suggestions dropdown */}
          {showSuggestions && (
            <div className="search-suggestions">
              {loading ? (
                <div className="suggestion-loading">
                  <div className="loading-spinner"></div>
                  <span>Searching...</span>
                </div>
              ) : searchSuggestions.length > 0 ? (
                <>
                  {searchSuggestions.map((game, index) => (
                    <div
                      key={game.id}
                      className={`suggestion-item ${
                        index === selectedIndex ? "selected" : ""
                      }`}
                      onClick={() => handleSuggestionClick(game)}
                    >
                      <div className="suggestion-image">
                        <img
                          src={
                            game.background_image ||
                            "https://via.placeholder.com/60x40?text=No+Image"
                          }
                          alt={game.name}
                        />
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-title">{game.name}</div>
                        <div className="suggestion-meta">
                          {game.released && (
                            <span className="suggestion-year">
                              {new Date(game.released).getFullYear()}
                            </span>
                          )}
                          {game.genres && game.genres.length > 0 && (
                            <span className="suggestion-genre">
                              {game.genres[0].name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="suggestion-rating">
                        ⭐ {game.rating.toFixed(1)}
                      </div>
                    </div>
                  ))}
                  <div className="suggestion-footer">
                    <button
                      onClick={handleSearchSubmit}
                      className="view-all-results"
                    >
                      <Search size={14} />
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </>
              ) : (
                <div className="suggestion-empty">
                  No games found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
