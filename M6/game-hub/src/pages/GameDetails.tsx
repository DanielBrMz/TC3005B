import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getGameById,
  getGameScreenshots,
  getRelatedGames,
} from "../services/gameService";
import type { GameDetail, Screenshot } from "../types/game";
import GameCard from "../components/GameCard";
import "./GameDetails.css";

const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [relatedGames, setRelatedGames] = useState<GameDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch main game details
        const gameData = await getGameById(parseInt(id));
        setGame(gameData);

        // Fetch screenshots
        try {
          const screenshotsData = await getGameScreenshots(parseInt(id));
          setScreenshots(screenshotsData.results || []);
        } catch (screenshotError) {
          console.warn("Could not fetch screenshots:", screenshotError);
        }

        // Fetch related games (games with similar genres)
        if (gameData.genres && gameData.genres.length > 0) {
          try {
            const relatedData = await getRelatedGames(gameData.genres[0].slug);
            setRelatedGames(relatedData.results.slice(0, 4));
          } catch (relatedError) {
            console.warn("Could not fetch related games:", relatedError);
          }
        }
      } catch (err) {
        setError("Failed to load game details. Please try again later.");
        console.error("Error fetching game details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]);

  // Helper function to render star rating
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="rating-stars">
        {"★".repeat(fullStars)}
        {hasHalfStar && "☆"}
        {"☆".repeat(emptyStars)}
      </div>
    );
  };

  // Helper function to format release date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to strip HTML tags from description
  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return (
      <div className="game-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading game details...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="game-details-page">
        <Link to="/" className="back-button">
          ← Back to Home
        </Link>
        <div className="error-message">{error || "Game not found"}</div>
      </div>
    );
  }

  return (
    <div className="game-details-page">
      <Link to="/" className="back-button">
        ← Back to Home
      </Link>

      {/* Game Header */}
      <div className="game-header">
        <img
          src={
            game.background_image ||
            "https://via.placeholder.com/300x400?text=No+Image"
          }
          alt={game.name}
          className="game-poster"
        />

        <div className="game-info">
          <h1 className="game-title">{game.name}</h1>

          <div className="game-meta">
            <div className="meta-item">
              <span className="meta-label">Released:</span>
              <span className="meta-value">
                {game.released
                  ? formatDate(game.released)
                  : "Release date unknown"}
              </span>
            </div>

            <div className="meta-item">
              <span className="meta-label">Rating:</span>
              <div className="rating-display">
                {renderStarRating(game.rating)}
                <span className="rating-text">{game.rating.toFixed(1)}/5</span>
              </div>
            </div>

            <div className="meta-item">
              <span className="meta-label">Platforms:</span>
              <div className="platforms-list">
                {game.platforms?.map((platform) => (
                  <span key={platform.platform.id} className="platform-tag">
                    {platform.platform.name}
                  </span>
                )) || <span className="meta-value">Unknown</span>}
              </div>
            </div>

            <div className="meta-item">
              <span className="meta-label">Genres:</span>
              <div className="genres-list">
                {game.genres?.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                )) || <span className="meta-value">Unknown</span>}
              </div>
            </div>

            {game.developers && game.developers.length > 0 && (
              <div className="meta-item">
                <span className="meta-label">Developer:</span>
                <span className="meta-value">
                  {game.developers.map((dev) => dev.name).join(", ")}
                </span>
              </div>
            )}

            {game.publishers && game.publishers.length > 0 && (
              <div className="meta-item">
                <span className="meta-label">Publisher:</span>
                <span className="meta-value">
                  {game.publishers.map((pub) => pub.name).join(", ")}
                </span>
              </div>
            )}
          </div>

          <div className="game-actions">
            <button className="action-button primary-button">
              Add to Library
            </button>
            <button className="action-button secondary-button">
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Game Description */}
      {game.description && (
        <div className="game-description">
          <h2 className="section-title">About This Game</h2>
          <div className="description-text">
            {stripHtmlTags(game.description)}
          </div>
        </div>
      )}

      {/* Screenshots */}
      {screenshots.length > 0 && (
        <div className="screenshots-section">
          <h2 className="section-title">Screenshots</h2>
          <div className="screenshots-grid">
            {screenshots.slice(0, 6).map((screenshot, index) => (
              <div key={screenshot.id || index} className="screenshot-item">
                <img src={screenshot.image} alt={`Screenshot ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Requirements (Placeholder) */}
      <div className="requirements-section">
        <h2 className="section-title">System Requirements</h2>
        <div className="requirements-grid">
          <div className="requirement-category">
            <h4>Minimum Requirements</h4>
            <div className="requirement-item">
              <span className="requirement-label">OS:</span>
              <span className="requirement-value">Windows 10 64-bit</span>
            </div>
            <div className="requirement-item">
              <span className="requirement-label">Processor:</span>
              <span className="requirement-value">
                Intel Core i5-3470 / AMD FX-6300
              </span>
            </div>
            <div className="requirement-item">
              <span className="requirement-label">Memory:</span>
              <span className="requirement-value">8 GB RAM</span>
            </div>
            <div className="requirement-item">
              <span className="requirement-label">Graphics:</span>
              <span className="requirement-value">
                NVIDIA GTX 960 / AMD R9 280
              </span>
            </div>
            <div className="requirement-item">
              <span className="requirement-label">Storage:</span>
              <span className="requirement-value">50 GB available space</span>
            </div>
          </div>

          <div className="requirement-category">
            <h4>Recommended Requirements</h4>
            <div className="requirement-item">
              <span className="requirement-label">OS:</span>
              <span className="requirement-value">Windows 11 64-bit</span>
            </div>
            <div className="requirement-item">
              <span className="requirement-label">Processor:</span>
              <span className="requirement-value">
                Intel Core i7-8700K / AMD Ryzen 5 3600
              </span>
            </div>
            <div className="requirement-item">
              <span className="requirement-label">Memory:</span>
              <span className="requirement-value">16 GB RAM</span>
            </div>
            <div className="requirement-item">
              <span className="requirement-label">Graphics:</span>
              <span className="requirement-value">
                NVIDIA RTX 3070 / AMD RX 6700 XT
              </span>
            </div>
            <div className="requirement-item">
              <span className="requirement-label">Storage:</span>
              <span className="requirement-value">
                50 GB available space (SSD recommended)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Games */}
      {relatedGames.length > 0 && (
        <div className="related-games-section">
          <h2 className="section-title">Similar Games</h2>
          <div className="related-games-grid">
            {relatedGames.map((relatedGame) => (
              <GameCard key={relatedGame.id} game={relatedGame} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;
