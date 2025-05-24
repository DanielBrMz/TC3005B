import React, { useState, useEffect } from "react";
import { Trophy, Clock, Calendar, Star, TrendingUp, Users } from "lucide-react";
import "./Dashboard.css";

interface PlayedGame {
  id: number;
  name: string;
  playTime: number;
  lastPlayed: string;
  achievement?: string;
  rating?: number;
}

const Dashboard: React.FC = () => {
  const [playedGames, setPlayedGames] = useState<PlayedGame[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sample game pool for dynamic rotation
  const gamePool: PlayedGame[] = [
    {
      id: 1,
      name: "The Witcher 3: Wild Hunt",
      playTime: 120,
      lastPlayed: "2023-05-15",
      achievement: "Master Explorer",
      rating: 4.8,
    },
    {
      id: 2,
      name: "Cyberpunk 2077",
      playTime: 45,
      lastPlayed: "2023-05-10",
      achievement: "Night City Legend",
      rating: 4.2,
    },
    {
      id: 3,
      name: "Elden Ring",
      playTime: 78,
      lastPlayed: "2023-05-18",
      achievement: "Elden Lord",
      rating: 4.9,
    },
    {
      id: 4,
      name: "God of War",
      playTime: 52,
      lastPlayed: "2023-05-12",
      achievement: "Kratos' Fury",
      rating: 4.7,
    },
    {
      id: 5,
      name: "Horizon Zero Dawn",
      playTime: 89,
      lastPlayed: "2023-05-16",
      achievement: "Machine Hunter",
      rating: 4.6,
    },
    {
      id: 6,
      name: "Red Dead Redemption 2",
      playTime: 134,
      lastPlayed: "2023-05-14",
      achievement: "Outlaw Legend",
      rating: 4.8,
    },
    {
      id: 7,
      name: "Assassin's Creed Valhalla",
      playTime: 67,
      lastPlayed: "2023-05-11",
      achievement: "Viking Warrior",
      rating: 4.3,
    },
    {
      id: 8,
      name: "Spider-Man Remastered",
      playTime: 32,
      lastPlayed: "2023-05-17",
      achievement: "Web Slinger",
      rating: 4.5,
    },
    {
      id: 9,
      name: "Ghost of Tsushima",
      playTime: 71,
      lastPlayed: "2023-05-13",
      achievement: "Samurai Master",
      rating: 4.7,
    },
    {
      id: 10,
      name: "Death Stranding",
      playTime: 58,
      lastPlayed: "2023-05-09",
      achievement: "Bridge Builder",
      rating: 4.1,
    },
  ];

  // Function to shuffle and select random games
  const generateRandomGames = () => {
    const shuffled = [...gamePool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5); // Show 5 random games
  };

  // Initialize with random games
  useEffect(() => {
    setPlayedGames(generateRandomGames());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Listen for page refresh or focus to update games
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setRefreshKey((prev) => prev + 1);
      }
    };

    const handleFocus = () => {
      setRefreshKey((prev) => prev + 1);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Calculate dynamic stats
  const totalPlayTime = playedGames.reduce(
    (sum, game) => sum + game.playTime,
    0
  );
  const averageRating =
    playedGames.reduce((sum, game) => sum + (game.rating || 0), 0) /
    playedGames.length;
  const achievementsCount = playedGames.filter(
    (game) => game.achievement
  ).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Your Game Dashboard</h1>
        <p className="dashboard-intro">
          Track your gaming activity and see your stats!
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Trophy size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Games</h3>
            <p className="stat-value">{playedGames.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Play Time</h3>
            <p className="stat-value">{totalPlayTime} hours</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>Last Played</h3>
            <p className="stat-value">
              {formatDate(playedGames[0]?.lastPlayed || "")}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <h3>Avg Rating</h3>
            <p className="stat-value">{averageRating.toFixed(1)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-games-section">
          <div className="section-header">
            <h2>Recently Played Games</h2>
            <button
              className="refresh-button"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              title="Refresh games"
            >
              <TrendingUp size={16} />
              Refresh
            </button>
          </div>

          <div className="recent-games">
            <div className="games-table-container">
              <table className="games-table">
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>Play Time</th>
                    <th>Last Played</th>
                    <th>Achievement</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {playedGames.map((game) => (
                    <tr key={`${game.id}-${refreshKey}`} className="game-row">
                      <td className="game-name">
                        <div className="game-info">
                          <strong>{game.name}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="play-time">
                          <Clock size={14} />
                          {game.playTime} hours
                        </div>
                      </td>
                      <td>{formatDate(game.lastPlayed)}</td>
                      <td>
                        {game.achievement && (
                          <div className="achievement">
                            <Trophy size={14} />
                            {game.achievement}
                          </div>
                        )}
                      </td>
                      <td>
                        {game.rating && (
                          <div className="rating">
                            <Star size={14} />
                            {game.rating.toFixed(1)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="achievements-section">
          <h2>Achievement Summary</h2>
          <div className="achievement-stats">
            <div className="achievement-card">
              <div className="achievement-icon">
                <Trophy size={32} />
              </div>
              <div className="achievement-content">
                <h3>Total Achievements</h3>
                <p className="achievement-value">{achievementsCount * 25}</p>
                <span className="achievement-subtitle">Across all games</span>
              </div>
            </div>

            <div className="achievement-card">
              <div className="achievement-icon">
                <Star size={32} />
              </div>
              <div className="achievement-content">
                <h3>Rare Achievements</h3>
                <p className="achievement-value">
                  {Math.floor(achievementsCount * 6.4)}
                </p>
                <span className="achievement-subtitle">
                  Less than 5% have these
                </span>
              </div>
            </div>

            <div className="achievement-card">
              <div className="achievement-icon">
                <TrendingUp size={32} />
              </div>
              <div className="achievement-content">
                <h3>Completion Rate</h3>
                <p className="achievement-value">
                  {Math.floor(68 + Math.random() * 15)}%
                </p>
                <span className="achievement-subtitle">
                  Average across library
                </span>
              </div>
            </div>

            <div className="achievement-card">
              <div className="achievement-icon">
                <Users size={32} />
              </div>
              <div className="achievement-content">
                <h3>Rank</h3>
                <p className="achievement-value">
                  Top {Math.floor(5 + Math.random() * 10)}%
                </p>
                <span className="achievement-subtitle">Among friends</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
