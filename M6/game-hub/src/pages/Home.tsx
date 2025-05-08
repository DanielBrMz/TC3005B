import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGames } from "../services/gameService";
import { priceGenerator } from "../utils/priceGenerator";
import type { Game } from "../types/game";
import GameCard from "../components/GameCard";
import "./Home.css";

const Home: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to shuffle array for dynamic content on each page visit
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
        console.log("Fetching games with intelligent pricing system...");

        // Fetch more games for better variety in dynamic rotation
        const response = await getGames(1, 24);

        // Shuffle the games for dynamic content on refresh
        const shuffledGames = shuffleArray(response.results);

        // First 4 games for featured carousel
        setFeaturedGames(shuffledGames.slice(0, 4));

        // Rest for regular grid, also shuffled for variety
        setGames(shuffledGames.slice(4));

        console.log(
          "Games loaded with intelligent pricing applied to each game"
        );
        setLoading(false);
      } catch (err) {
        setError("Failed to load games. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchGames();
  }, []); // Empty dependency array ensures games are shuffled on each component mount

  return (
    <div className="home-page">
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading games with intelligent pricing...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {/* Featured games carousel with intelligent pricing */}
          <div className="featured-section">
            <h2 className="section-title">FEATURED & RECOMMENDED</h2>
            <div className="featured-carousel">
              {featuredGames.map((game) => {
                // Use our intelligent pricing system for consistent, realistic prices
                const price = priceGenerator.generatePrice(game);

                return (
                  <div key={game.id} className="featured-item">
                    <Link
                      to={`/game/${game.id}`}
                      className="featured-image-link"
                    >
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
                      <Link
                        to={`/game/${game.id}`}
                        className="featured-title-link"
                      >
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
                          title={`View details for ${game.name} - Price calculated based on game characteristics`}
                        >
                          <span className="price-tag">${price.toFixed(2)}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special offers section with intelligent discount system */}
          <div className="special-offers-section">
            <div className="section-header">
              <h2 className="section-title">SPECIAL OFFERS</h2>
              <Link to="/search" className="see-more">
                BROWSE MORE
              </Link>
            </div>
            <div className="special-offers-grid">
              {games.slice(0, 3).map((game) => {
                // Generate intelligent discount pricing for special offers
                const discountPercent = Math.floor(Math.random() * 65) + 10; // 10-75% discount
                const discountInfo = priceGenerator.generateDiscountedPrice(
                  game,
                  discountPercent
                );

                return (
                  <div key={game.id} className="offer-card">
                    <Link to={`/game/${game.id}`} className="offer-image-link">
                      <div className="offer-image">
                        <img src={game.background_image} alt={game.name} />
                      </div>
                    </Link>
                    <div className="offer-info">
                      <Link
                        to={`/game/${game.id}`}
                        className="offer-title-link"
                      >
                        <div className="offer-title">{game.name}</div>
                      </Link>
                      <div className="offer-discount">
                        <span className="discount-badge">
                          -
                          {Math.round(
                            ((discountInfo.original - discountInfo.discounted) /
                              discountInfo.original) *
                              100
                          )}
                          %
                        </span>
                        <Link
                          to={`/game/${game.id}`}
                          className="price-container-link"
                          title={`Special offer: Save $${discountInfo.savings.toFixed(
                            2
                          )} on ${game.name}`}
                        >
                          <div className="price-container">
                            <span className="original-price">
                              ${discountInfo.original.toFixed(2)}
                            </span>
                            <span className="discounted-price">
                              ${discountInfo.discounted.toFixed(2)}
                            </span>
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
              <Link to="/search" className="category-card">
                Action
              </Link>
              <Link to="/search" className="category-card">
                Adventure
              </Link>
              <Link to="/search" className="category-card">
                RPG
              </Link>
              <Link to="/search" className="category-card">
                Strategy
              </Link>
              <Link to="/search" className="category-card">
                Simulation
              </Link>
              <Link to="/search" className="category-card">
                Sports
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
