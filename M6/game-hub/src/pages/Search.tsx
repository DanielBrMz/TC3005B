import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X, ChevronDown, ChevronUp, RotateCcw, Loader2 } from 'lucide-react';
import { searchGames, getGenres, getPlatforms } from '../services/gameService';
import type { Game, Genre, Platform } from '../types/game';
import GameCard from '../components/GameCard';
import './Search.css';

interface FilterOptions {
  genres: Genre[];
  platforms: Platform[];
}

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get('q') || '');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  
  // Filter states
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('-rating');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    genres: [],
    platforms: []
  });

  // Load filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [genresResponse, platformsResponse] = await Promise.all([
          getGenres(),
          getPlatforms()
        ]);
        
        setFilterOptions({
          genres: genresResponse.results || [],
          platforms: platformsResponse.results || []
        });
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };

    loadFilterOptions();
  }, []);

  // Handle search from URL parameters
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      performSearch(urlQuery, 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = async (
    searchQuery: string, 
    pageNum: number = 1, 
    reset: boolean = false
  ) => {
    if (!searchQuery.trim() && selectedGenres.length === 0 && selectedPlatforms.length === 0) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const genresParam = selectedGenres.length > 0 ? selectedGenres.join(',') : undefined;
      const platformsParam = selectedPlatforms.length > 0 ? selectedPlatforms.join(',') : undefined;
      
      const response = await searchGames(
        searchQuery,
        pageNum,
        20,
        genresParam,
        platformsParam,
        sortOrder
      );
      
      if (reset || pageNum === 1) {
        setGames(response.results);
      } else {
        setGames(prev => [...prev, ...response.results]);
      }
      
      setHasMore(!!response.next);
      setSearched(true);
      setPage(pageNum);
      
    } catch (err) {
      setError('Failed to search games. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search query
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
    
    await performSearch(query, 1, true);
  };

  const handleFilterChange = () => {
    performSearch(query, 1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      performSearch(query, page + 1, false);
    }
  };

  const handleGenreToggle = (genreSlug: string) => {
    setSelectedGenres(prev => {
      const newGenres = prev.includes(genreSlug)
        ? prev.filter(g => g !== genreSlug)
        : [...prev, genreSlug];
      return newGenres;
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId];
      return newPlatforms;
    });
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedPlatforms([]);
    setSortOrder('-rating');
    setQuery('');
    setSearchParams({});
    setGames([]);
    setSearched(false);
  };

  // Apply filters when they change
  useEffect(() => {
    if (searched && (selectedGenres.length > 0 || selectedPlatforms.length > 0 || query)) {
      handleFilterChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenres, selectedPlatforms, sortOrder]);

  const sortOptions = [
    { value: '-rating', label: 'Rating (High to Low)' },
    { value: 'rating', label: 'Rating (Low to High)' },
    { value: '-released', label: 'Release Date (Newest)' },
    { value: 'released', label: 'Release Date (Oldest)' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: '-name', label: 'Name (Z-A)' },
    { value: '-metacritic', label: 'Metacritic Score' }
  ];

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Games</h1>
        <p className="search-intro">
          Discover your next favorite game! Search by title and filter by genre, platform, and more.
        </p>
      </div>
      
      {/* Search Form */}
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for games..."
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? <Loader2 size={16} className="spinning" /> : <SearchIcon size={16} />}
          </button>
        </div>
      </form>

      {/* Filter Controls */}
      <div className="filter-controls">
        <button 
          className="filter-toggle-button"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {(selectedGenres.length > 0 || selectedPlatforms.length > 0) && (
          <button className="clear-filters-button" onClick={clearFilters}>
            <RotateCcw size={16} />
            Clear All Filters
          </button>
        )}
        
        <div className="sort-container">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-section">
            <h3>Genres</h3>
            <div className="filter-options">
              {filterOptions.genres.slice(0, 12).map(genre => (
                <label key={genre.id} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.slug)}
                    onChange={() => handleGenreToggle(genre.slug)}
                  />
                  <span className="filter-label">{genre.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Platforms</h3>
            <div className="filter-options">
              {filterOptions.platforms.slice(0, 8).map(platform => (
                <label key={platform.id} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id.toString())}
                    onChange={() => handlePlatformToggle(platform.id.toString())}
                  />
                  <span className="filter-label">{platform.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(selectedGenres.length > 0 || selectedPlatforms.length > 0) && (
        <div className="active-filters">
          <h4>Active Filters:</h4>
          <div className="filter-tags">
            {selectedGenres.map(genreSlug => {
              const genre = filterOptions.genres.find(g => g.slug === genreSlug);
              return genre ? (
                <span key={genreSlug} className="filter-tag">
                  {genre.name}
                  <button 
                    onClick={() => handleGenreToggle(genreSlug)}
                    className="remove-filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null;
            })}
            {selectedPlatforms.map(platformId => {
              const platform = filterOptions.platforms.find(p => p.id.toString() === platformId);
              return platform ? (
                <span key={platformId} className="filter-tag">
                  {platform.name}
                  <button 
                    onClick={() => handlePlatformToggle(platformId)}
                    className="remove-filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && page === 1 && (
        <div className="loading">
          <Loader2 size={36} className="loading-spinner spinning" />
          <span>Searching for games...</span>
        </div>
      )}

      {/* Error State */}
      {error && <div className="error">{error}</div>}
      
      {/* No Results */}
      {searched && !loading && !error && games.length === 0 && (
        <div className="no-results">
          <SearchIcon size={48} className="no-results-icon" />
          <h3>No games found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      )}
      
      {/* Search Results */}
      {!loading && !error && games.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <h2>Search Results ({games.length} games found)</h2>
          </div>
          
          <div className="results-grid">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="load-more-container">
              <button 
                className="load-more-button"
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spinning" />
                    Loading...
                  </>
                ) : (
                  'Load More Games'
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;