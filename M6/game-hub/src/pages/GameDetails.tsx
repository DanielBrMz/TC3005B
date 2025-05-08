import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Calendar,
  Monitor,
  Users,
  Trophy,
  Heart,
  ShoppingCart,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  getGameById,
  getGameScreenshots,
  getSimilarGames,
} from "../services/gameService";
import type { GameDetail, Screenshot, Game } from "../types/game";
import GameCard from "../components/GameCard";
import "./GameDetails.css";

const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [similarGames, setSimilarGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [similarGamesLoading, setSimilarGamesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Function to fetch similar games independently
  const fetchSimilarGames = async (gameData: GameDetail) => {
    setSimilarGamesLoading(true);
    try {
      console.log("Fetching similar games for:", gameData.name);
      const similarData = await getSimilarGames(gameData);
      setSimilarGames(similarData);
      console.log(`Found ${similarData.length} similar games`);
    } catch (error) {
      console.error("Error fetching similar games:", error);
      // Don't show error to user for similar games, just log it
    } finally {
      setSimilarGamesLoading(false);
    }
  };

  // Function to refresh similar games manually
  const refreshSimilarGames = () => {
    if (game) {
      fetchSimilarGames(game);
    }
  };

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        console.log("Fetching game details for ID:", id);

        // Fetch main game details
        const gameData = await getGameById(parseInt(id));
        setGame(gameData);

        // Fetch screenshots in parallel (non-blocking)
        getGameScreenshots(parseInt(id))
          .then((screenshotsData) => {
            setScreenshots(screenshotsData.results || []);
          })
          .catch((screenshotError) => {
            console.warn("Could not fetch screenshots:", screenshotError);
          });

        // Fetch similar games using our new intelligent system
        // This runs separately so it doesn't block the main game details loading
        fetchSimilarGames(gameData);
      } catch (err) {
        setError("Failed to load game details. Please try again later.");
        console.error("Error fetching game details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [id]); // Re-run when game ID changes

  // Helper function to render star rating
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="rating-stars">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`full-${i}`} size={16} fill="currentColor" />
          ))}
        {hasHalfStar && (
          <Star key="half" size={16} fill="currentColor" opacity={0.5} />
        )}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`empty-${i}`} size={16} />
          ))}
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

  // Generate random price for demonstration
  const generatePrice = () => {
    const prices = [9.99, 14.99, 19.99, 24.99, 29.99, 39.99, 49.99, 59.99];
    return prices[Math.floor(Math.random() * prices.length)];
  };

  if (loading) {
    return (
      <div className="game-details-page">
        <div className="loading-container">
          <Loader2 size={36} className="loading-spinner spinning" />
          <p>Loading game details...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="game-details-page">
        <Link to="/" className="back-button">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <div className="error-message">{error || "Game not found"}</div>
      </div>
    );
  }

  const gamePrice = generatePrice();

  return (
    <div className="game-details-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={16} />
        Back to Home
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
              <Calendar size={16} />
              <span className="meta-label">Released:</span>
              <span className="meta-value">
                {game.released
                  ? formatDate(game.released)
                  : "Release date unknown"}
              </span>
            </div>

            <div className="meta-item">
              <Star size={16} />
              <span className="meta-label">Rating:</span>
              <div className="rating-display">
                {renderStarRating(game.rating)}
                <span className="rating-text">{game.rating.toFixed(1)}/5</span>
              </div>
            </div>

            <div className="meta-item">
              <Monitor size={16} />
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
              <Trophy size={16} />
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
                <Users size={16} />
                <span className="meta-label">Developer:</span>
                <span className="meta-value">
                  {game.developers.map((dev) => dev.name).join(", ")}
                </span>
              </div>
            )}

            {game.publishers && game.publishers.length > 0 && (
              <div className="meta-item">
                <Users size={16} />
                <span className="meta-label">Publisher:</span>
                <span className="meta-value">
                  {game.publishers.map((pub) => pub.name).join(", ")}
                </span>
              </div>
            )}

            {/* Price Display */}
            <div className="meta-item price-item">
              <ShoppingCart size={16} />
              <span className="meta-label">Price:</span>
              <span className="game-price">${gamePrice}</span>
            </div>
          </div>

          <div className="game-actions">
            <button className="action-button primary-button">
              <ShoppingCart size={16} />
              Add to Cart
            </button>
            <button
              className={`action-button secondary-button ${
                isWishlisted ? "wishlisted" : ""
              }`}
              onClick={() => setIsWishlisted(!isWishlisted)}
            >
              <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
              {isWishlisted ? "In Wishlist" : "Add to Wishlist"}
            </button>
            {game.website && (
              <a
                href={game.website}
                target="_blank"
                rel="noopener noreferrer"
                className="action-button tertiary-button"
              >
                <ExternalLink size={16} />
                Official Site
              </a>
            )}
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
            <h4>
              <Monitor size={20} />
              Minimum Requirements
            </h4>
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
            <h4>
              <Trophy size={20} />
              Recommended Requirements
            </h4>
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

      {/* Similar Games - Now with intelligent matching */}
      <div className="similar-games-section">
        <div className="similar-games-header">
          <h2 className="section-title">Games Similar to {game.name}</h2>
          <button
            className="refresh-similar-button"
            onClick={refreshSimilarGames}
            disabled={similarGamesLoading}
            title="Find more similar games"
          >
            {similarGamesLoading ? (
              <Loader2 size={16} className="spinning" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
        </div>

        {similarGamesLoading ? (
          <div className="similar-games-loading">
            <Loader2 size={24} className="spinning" />
            <p>Finding games similar to {game.name}...</p>
          </div>
        ) : similarGames.length > 0 ? (
          <>
            <div className="similarity-explanation">
              <p>
                These games share similar genres, developers, themes, or release
                timeframes with {game.name}. Our matching algorithm considers
                multiple factors to find truly comparable gaming experiences.
              </p>
            </div>
            <div className="similar-games-grid">
              {similarGames.map((similarGame) => (
                <GameCard key={similarGame.id} game={similarGame} />
              ))}
            </div>
          </>
        ) : (
          <div className="no-similar-games">
            <p>
              No similar games found. This might be a unique game or our
              similarity algorithm needs more data to work with.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails;
