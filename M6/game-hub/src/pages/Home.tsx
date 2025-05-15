import React, { useEffect, useState } from 'react';
import { getGames } from '../services/gameService';
import type { Game } from '../types/game';
import GameCard from '../components/GameCard';
import './Home.css';

const Home: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await getGames(1, 12); // Get 12 games for the homepage
        setGames(response.results);
        setLoading(false);
      } catch (err) {
        setError('Failed to load games. Please try again later.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchGames();
  }, []);

  return (
    <div className="home-page">
      <h1>Welcome to Game Hub</h1>
      <p className="home-intro">Discover and track your favorite games!</p>
      
      {loading && <div className="loading">Loading games...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && (
        <>
          <h2>Popular Games</h2>
          <div className="card-grid">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;