// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import { getGames } from "../services/gameService";
import type { Game } from "../types/game";
import GameCard from "../components/GameCard";
import "./Home.css";

const Home: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await getGames(1, 16); // Get more games

        // First 4 games for featured carousel
        setFeaturedGames(response.results.slice(0, 4));

        // Rest for regular grid
        setGames(response.results.slice(4));

        setLoading(false);
      } catch (err) {
        setError("Failed to load games. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };

    fetchGames();
  }, []);

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
              {featuredGames.map((game) => (
                <div key={game.id} className="featured-item">
                  <div className="featured-image">
                    <img
                      src={
                        game.background_image ||
                        "https://via.placeholder.com/600x300?text=No+Image"
                      }
                      alt={game.name}
                    />
                  </div>
                  <div className="featured-info">
                    <h3 className="featured-title">{game.name}</h3>
                    <div className="featured-tags">
                      {game.genres &&
                        game.genres.slice(0, 3).map((genre) => (
                          <span key={genre.id} className="featured-tag">
                            {genre.name}
                          </span>
                        ))}
                    </div>
                    <div className="featured-price">
                      <span className="price-tag">$59.99</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special offers banner */}
          <div className="special-offers-banner">
            <h3>SPECIAL SALE - Save up to 90% on selected titles!</h3>
          </div>

          {/* Special offers section */}
          <div className="special-offers-section">
            <div className="section-header">
              <h2 className="section-title">SPECIAL OFFERS</h2>
              <div className="see-more">BROWSE MORE</div>
            </div>
            <div className="special-offers-grid">
              {games.slice(0, 3).map((game) => (
                <div key={game.id} className="offer-card">
                  <div className="offer-image">
                    <img src={game.background_image} alt={game.name} />
                  </div>
                  <div className="offer-info">
                    <div className="offer-title">{game.name}</div>
                    <div className="offer-discount">
                      <span className="discount-badge">-75%</span>
                      <div className="price-container">
                        <span className="original-price">$59.99</span>
                        <span className="discounted-price">$14.99</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              <div className="category-card">Action</div>
              <div className="category-card">Adventure</div>
              <div className="category-card">RPG</div>
              <div className="category-card">Strategy</div>
              <div className="category-card">Simulation</div>
              <div className="category-card">Sports</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
