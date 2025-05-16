import React from "react";
import type { Game } from "../types/game";
import "./GameCard.css";

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  // Format release date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get platforms as a comma-separated string
  const platforms = game.platforms
    ? game.platforms.map((p) => p.platform.name).join(", ")
    : "Unknown platform";

  return (
    <div className="game-card">
      <div className="game-card-image">
        <img
          src={
            game.background_image ||
            "https://via.placeholder.com/300x150?text=No+Image"
          }
          alt={game.name}
        />
        <div className="game-rating">★ {game.rating.toFixed(1)}</div>
      </div>
      <div className="game-card-content">
        <h3 className="game-title">{game.name}</h3>
        <div className="game-release-date">
          {game.released ? formatDate(game.released) : "Release date unknown"}
        </div>
        <div className="game-platforms">{platforms}</div>
        <div className="game-tags">
          {game.genres &&
            game.genres.slice(0, 3).map((genre) => (
              <span key={genre.id} className="game-tag">
                {genre.name}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
