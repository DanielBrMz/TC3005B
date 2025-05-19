import React, { useState } from 'react';
import { searchGames } from '../services/gameService';
import type { Game } from '../types/game';
import GameCard from '../components/GameCard';
import './Search.css';

const Search: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await searchGames(query);
      setGames(response.results);
      setSearched(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to search games. Please try again later.');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="search-page">
      <h1>Search Games</h1>
      <p className="search-intro">Looking for something specific? Search for games by title, genre, or platform!</p>
      
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for games..."
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
        </div>
      </form>
      
      {loading && <div className="loading">Searching for games...</div>}
      {error && <div className="error">{error}</div>}
      
      {searched && !loading && !error && games.length === 0 && (
        <div className="no-results">No games found for "{query}"</div>
      )}
      
      {!loading && !error && games.length > 0 && (
        <>
          <h2>Search Results</h2>
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

export default Search;