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
  Zap,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
} from "lucide-react";
import {
  getGameById,
  getGameScreenshots,
  getSimilarGames,
} from "../services/gameService";
import { priceGenerator } from "../utils/priceGenerator";
import { systemRequirementsGenerator } from "../utils/systemRequirementsGenerator";
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

  // New state for pricing and system requirements
  const [gamePrice, setGamePrice] = useState<number>(0);
  const [discountInfo, setDiscountInfo] = useState<{
    original: number;
    discounted: number;
    savings: number;
  } | null>(null);

  interface SystemRequirement {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
    directx?: string;
    network?: string;
    additional?: string;
  }

  interface SystemRequirements {
    minimum: SystemRequirement;
    recommended: SystemRequirement;
  }

  const [systemRequirements, setSystemRequirements] =
    useState<SystemRequirements | null>(null);
  const [showDiscount, setShowDiscount] = useState(false);

  // Function to fetch similar games independently
  const fetchSimilarGames = async (gameData: GameDetail) => {
    setSimilarGamesLoading(true);
    try {
      console.log("Fetching similar games for:", gameData.name);
      const similarData = await getSimilarGames(gameData);
      setSimilarGames(similarData);
      console.log(
        `Found ${similarData.length} similar games using intelligent matching`
      );
    } catch (error) {
      console.error("Error fetching similar games:", error);
      // Don't show error to user for similar games, just log it
    } finally {
      setSimilarGamesLoading(false);
    }
  };

  // Function to generate pricing and system requirements
  const generateGameData = (gameData: GameDetail) => {
    console.log(
      "Generating intelligent pricing and system requirements for:",
      gameData.name
    );

    // Generate consistent, intelligent pricing based on game characteristics
    const price = priceGenerator.generatePrice(gameData);
    setGamePrice(price);

    // Randomly decide if this game should have a discount (30% chance)
    const hasDiscount = Math.random() < 0.3;
    if (hasDiscount) {
      // Generate a realistic discount between 10% and 75%
      const discountPercent = Math.floor(Math.random() * 65) + 10;
      const discount = priceGenerator.generateDiscountedPrice(
        gameData,
        discountPercent
      );
      setDiscountInfo(discount);
      setShowDiscount(true);
    } else {
      setDiscountInfo(null);
      setShowDiscount(false);
    }

    // Generate realistic system requirements based on game characteristics
    const requirements =
      systemRequirementsGenerator.generateRequirements(gameData);
    setSystemRequirements(requirements);

    console.log("Generated pricing:", { price, hasDiscount, discountInfo });
    console.log(
      "Generated system requirements complexity based on game analysis"
    );
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

        console.log("Fetching comprehensive game details for ID:", id);

        // Fetch main game details first
        const gameData = await getGameById(parseInt(id));
        setGame(gameData);

        // Generate intelligent pricing and system requirements
        generateGameData(gameData);

        // Fetch screenshots in parallel (non-blocking for better UX)
        getGameScreenshots(parseInt(id))
          .then((screenshotsData) => {
            setScreenshots(screenshotsData.results || []);
            console.log(
              `Loaded ${screenshotsData.results?.length || 0} screenshots`
            );
          })
          .catch((screenshotError) => {
            console.warn("Could not fetch screenshots:", screenshotError);
          });

        // Fetch similar games using our intelligent matching system
        // This runs separately so it doesn't block the main content loading
        fetchSimilarGames(gameData);
      } catch (err) {
        setError("Failed to load game details. Please try again later.");
        console.error("Error fetching game details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Helper function to render star rating with visual feedback
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

  // Helper function to format release date in a user-friendly way
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to clean up HTML content from API responses
  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Helper function to get the appropriate icon for system requirement types
  const getRequirementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "processor":
        return <Cpu size={16} />;
      case "memory":
        return <MemoryStick size={16} />;
      case "graphics":
        return <Monitor size={16} />;
      case "storage":
        return <HardDrive size={16} />;
      case "network":
        return <Wifi size={16} />;
      default:
        return <Zap size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="game-details-page">
        <div className="loading-container">
          <Loader2 size={36} className="loading-spinner spinning" />
          <p>Loading comprehensive game details...</p>
          <small>
            Analyzing game characteristics for intelligent pricing and
            requirements...
          </small>
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

  return (
    <div className="game-details-page">
      <Link to="/" className="back-button">
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      {/* Game Header with Enhanced Pricing */}
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

            {/* Enhanced Price Display with Intelligent Pricing */}
            <div className="meta-item price-item">
              <ShoppingCart size={16} />
              <span className="meta-label">Price:</span>
              <div className="price-display">
                {showDiscount && discountInfo ? (
                  <div className="price-with-discount">
                    <span className="discount-badge">
                      -
                      {Math.round(
                        ((discountInfo.original - discountInfo.discounted) /
                          discountInfo.original) *
                          100
                      )}
                      %
                    </span>
                    <div className="price-breakdown">
                      <span className="original-price">
                        ${discountInfo.original.toFixed(2)}
                      </span>
                      <span className="current-price">
                        ${discountInfo.discounted.toFixed(2)}
                      </span>
                    </div>
                    <span className="savings-text">
                      Save ${discountInfo.savings.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="game-price">${gamePrice.toFixed(2)}</span>
                )}
              </div>
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

      {/* Dynamic System Requirements */}
      {systemRequirements && (
        <div className="requirements-section">
          <h2 className="section-title">System Requirements</h2>
          <div className="requirements-explanation">
            <p>
              These requirements are intelligently generated based on the game's
              release date, genre complexity, platform availability, and visual
              demands. Our algorithm analyzes multiple factors to provide
              realistic hardware specifications.
            </p>
          </div>

          <div className="requirements-grid">
            <div className="requirement-category">
              <h4>
                <Monitor size={20} />
                Minimum Requirements
              </h4>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("os")}
                </div>
                <span className="requirement-label">Operating System:</span>
                <span className="requirement-value">
                  {systemRequirements.minimum.os}
                </span>
              </div>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("processor")}
                </div>
                <span className="requirement-label">Processor:</span>
                <span className="requirement-value">
                  {systemRequirements.minimum.processor}
                </span>
              </div>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("memory")}
                </div>
                <span className="requirement-label">Memory:</span>
                <span className="requirement-value">
                  {systemRequirements.minimum.memory}
                </span>
              </div>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("graphics")}
                </div>
                <span className="requirement-label">Graphics:</span>
                <span className="requirement-value">
                  {systemRequirements.minimum.graphics}
                </span>
              </div>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("storage")}
                </div>
                <span className="requirement-label">Storage:</span>
                <span className="requirement-value">
                  {systemRequirements.minimum.storage}
                </span>
              </div>

              {systemRequirements.minimum.directx && (
                <div className="requirement-item">
                  <div className="requirement-icon">
                    {getRequirementIcon("directx")}
                  </div>
                  <span className="requirement-label">DirectX:</span>
                  <span className="requirement-value">
                    {systemRequirements.minimum.directx}
                  </span>
                </div>
              )}

              {systemRequirements.minimum.network && (
                <div className="requirement-item">
                  <div className="requirement-icon">
                    {getRequirementIcon("network")}
                  </div>
                  <span className="requirement-label">Network:</span>
                  <span className="requirement-value">
                    {systemRequirements.minimum.network}
                  </span>
                </div>
              )}
            </div>

            <div className="requirement-category">
              <h4>
                <Trophy size={20} />
                Recommended Requirements
              </h4>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("os")}
                </div>
                <span className="requirement-label">Operating System:</span>
                <span className="requirement-value">
                  {systemRequirements.recommended.os}
                </span>
              </div>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("processor")}
                </div>
                <span className="requirement-label">Processor:</span>
                <span className="requirement-value">
                  {systemRequirements.recommended.processor}
                </span>
              </div>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("memory")}
                </div>
                <span className="requirement-label">Memory:</span>
                <span className="requirement-value">
                  {systemRequirements.recommended.memory}
                </span>
              </div>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("graphics")}
                </div>
                <span className="requirement-label">Graphics:</span>
                <span className="requirement-value">
                  {systemRequirements.recommended.graphics}
                </span>
              </div>

              <div className="requirement-item">
                <div className="requirement-icon">
                  {getRequirementIcon("storage")}
                </div>
                <span className="requirement-label">Storage:</span>
                <span className="requirement-value">
                  {systemRequirements.recommended.storage}
                </span>
              </div>

              {systemRequirements.recommended.directx && (
                <div className="requirement-item">
                  <div className="requirement-icon">
                    {getRequirementIcon("directx")}
                  </div>
                  <span className="requirement-label">DirectX:</span>
                  <span className="requirement-value">
                    {systemRequirements.recommended.directx}
                  </span>
                </div>
              )}

              {systemRequirements.recommended.additional && (
                <div className="requirement-item additional-req">
                  <div className="requirement-icon">
                    {getRequirementIcon("additional")}
                  </div>
                  <span className="requirement-label">Additional Notes:</span>
                  <span className="requirement-value">
                    {systemRequirements.recommended.additional}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Similar Games with Intelligent Matching */}
      <div className="similar-games-section">
        <div className="similar-games-header">
          <h2 className="section-title">Games Similar to {game.name}</h2>
          <button
            className="refresh-similar-button"
            onClick={refreshSimilarGames}
            disabled={similarGamesLoading}
            title="Find more similar games using our intelligent matching algorithm"
          >
            {similarGamesLoading ? (
              <Loader2 size={16} className="spinning" />
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh Matches
          </button>
        </div>

        {similarGamesLoading ? (
          <div className="similar-games-loading">
            <Loader2 size={24} className="spinning" />
            <p>Analyzing {game.name} and finding truly similar games...</p>
            <small>
              Our algorithm considers genres, developers, release timeframes,
              platforms, and ratings
            </small>
          </div>
        ) : similarGames.length > 0 ? (
          <>
            <div className="similarity-explanation">
              <p>
                These games are carefully selected using our multi-factor
                similarity algorithm. We analyze genre overlaps, developer
                relationships, release timeframes, platform compatibility, and
                rating similarities to find games that truly match {game.name}'s
                characteristics and appeal.
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
              Our intelligent matching algorithm couldn't find sufficiently
              similar games. This might indicate that {game.name} is
              particularly unique, or we need more comprehensive data to make
              accurate comparisons.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDetails;
