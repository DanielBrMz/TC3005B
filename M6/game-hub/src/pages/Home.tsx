import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGames } from "../services/gameService";
import type { Game } from "../types/game";
import GameCard from "../components/GameCard";
import "./Home.css";

const Home: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to generate random prices for demonstration
  const generateRandomPrice = () => {
    const prices = [9.99, 14.99, 19.99, 24.99, 29.99, 39.99, 49.99, 59.99];
    return prices[Math.floor(Math.random() * prices.length)];
  };

  // Function to generate random discount percentage
  const generateRandomDiscount = () => {
    const discounts = [10, 15, 25, 30, 40, 50, 60, 75];
    return discounts[Math.floor(Math.random() * discounts.length)];
  };

  // Function to shuffle array for dynamic content
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        // Fetch more games for dynamic rotation
        const response = await getGames(1, 24);

        // Shuffle the games for dynamic content on refresh
        const shuffledGames = shuffleArray(response.results);

        // First 4 games for featured carousel
        setFeaturedGames(shuffledGames.slice(0, 4));

        // Rest for regular grid, also shuffled
        setGames(shuffledGames.slice(4));

        setLoading(false);
      } catch (err) {
        setError("Failed to load games. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchGames();
  }, []); // Empty dependency array means this runs once, but games are shuffled each time

  return (
    <div className="home-page">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading games...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {/* Featured games carousel */}
          <div className="featured-section">
            <h2 className="section-title">FEATURED & RECOMMENDED</h2>
            <div className="featured-carousel">
              {featuredGames.map((game) => {
                const price = generateRandomPrice();
                return (
                  <div key={game.id} className="featured-item">
                    <Link to={`/game/${game.id}`} className="featured-image-link">
                      <div className="featured-image">
                        <img
                          src={
                            game.background_image ||
                            "https://via.placeholder.com/600x300?text=No+Image"
                          }
                          alt={game.name}
                        />
                      </div>
                    </Link>
                    <div className="featured-info">
                      <Link to={`/game/${game.id}`} className="featured-title-link">
                        <h3 className="featured-title">{game.name}</h3>
                      </Link>
                      <div className="featured-tags">
                        {game.genres &&
                          game.genres.slice(0, 3).map((genre) => (
                            <span key={genre.id} className="featured-tag">
                              {genre.name}
                            </span>
                          ))}
                      </div>
                      <div className="featured-price">
                        <Link 
                          to={`/game/${game.id}`} 
                          className="price-tag-link"
                        >
                          <span className="price-tag">${price}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special offers section */}
          <div className="special-offers-section">
            <div className="section-header">
              <h2 className="section-title">SPECIAL OFFERS</h2>
              <Link to="/search" className="see-more">BROWSE MORE</Link>
            </div>
            <div className="special-offers-grid">
              {games.slice(0, 3).map((game) => {
                const originalPrice = generateRandomPrice();
                const discount = generateRandomDiscount();
                const discountedPrice = (originalPrice * (1 - discount / 100)).toFixed(2);
                
                return (
                  <div key={game.id} className="offer-card">
                    <Link to={`/game/${game.id}`} className="offer-image-link">
                      <div className="offer-image">
                        <img src={game.background_image} alt={game.name} />
                      </div>
                    </Link>
                    <div className="offer-info">
                      <Link to={`/game/${game.id}`} className="offer-title-link">
                        <div className="offer-title">{game.name}</div>
                      </Link>
                      <div className="offer-discount">
                        <span className="discount-badge">-{discount}%</span>
                        <Link 
                          to={`/game/${game.id}`} 
                          className="price-container-link"
                        >
                          <div className="price-container">
                            <span className="original-price">${originalPrice}</span>
                            <span className="discounted-price">${discountedPrice}</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popular games grid */}
          <div className="popular-games-section">
            <h2 className="section-title">POPULAR GAMES</h2>
            <div className="card-grid">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>

          {/* Browse by category */}
          <div className="categories-section">
            <h2 className="section-title">BROWSE BY CATEGORY</h2>
            <div className="categories-grid">
              <Link to="/search" className="category-card">Action</Link>
              <Link to="/search" className="category-card">Adventure</Link>
              <Link to="/search" className="category-card">RPG</Link>
              <Link to="/search" className="category-card">Strategy</Link>
              <Link to="/search" className="category-card">Simulation</Link>
              <Link to="/search" className="category-card">Sports</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;