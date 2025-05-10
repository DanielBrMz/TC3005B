import axios from 'axios';
import type { GamesResponse, Game, GameDetail, ScreenshotsResponse } from '../types/game';

const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

export const getGames = async (page = 1, pageSize = 20): Promise<GamesResponse> => {
  try {
    const response = await axios.get<GamesResponse>(`${BASE_URL}/games`, {
      params: {
        key: API_KEY,
        page,
        page_size: pageSize
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
};

interface SearchParams {
  key: string;
  search: string;
  page: number;
  page_size: number;
  genres?: string;
  platforms?: string;
  ordering?: string;
}

export const searchGames = async (
  query: string, 
  page = 1, 
  pageSize = 20,
  genres?: string,
  platforms?: string,
  ordering?: string
): Promise<GamesResponse> => {
  try {
    const params: SearchParams = {
      key: API_KEY,
      search: query,
      page,
      page_size: pageSize
    };

    // Add optional filters
    if (genres) params.genres = genres;
    if (platforms) params.platforms = platforms;
    if (ordering) params.ordering = ordering;

    const response = await axios.get<GamesResponse>(`${BASE_URL}/games`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error searching games:', error);
    throw error;
  }
};

export const getGameById = async (id: number): Promise<GameDetail> => {
  try {
    const response = await axios.get<GameDetail>(`${BASE_URL}/games/${id}`, {
      params: {
        key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching game with id ${id}:`, error);
    throw error;
  }
};

export const getGameScreenshots = async (id: number): Promise<ScreenshotsResponse> => {
  try {
    const response = await axios.get<ScreenshotsResponse>(`${BASE_URL}/games/${id}/screenshots`, {
      params: {
        key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching screenshots for game ${id}:`, error);
    throw error;
  }
};

// This is the new, intelligent similar games function
export const getSimilarGames = async (currentGame: GameDetail): Promise<Game[]> => {
  try {
    console.log('Finding similar games for:', currentGame.name);
    
    // Step 1: Create multiple search strategies to find truly similar games
    const searchStrategies: Promise<GamesResponse>[] = [];
    
    // Strategy 1: Same developer games (if available)
    if (currentGame.developers && currentGame.developers.length > 0) {
      const developerQuery = searchGames(
        currentGame.developers[0].name,
        1,
        10,
        undefined,
        undefined,
        '-rating'
      );
      searchStrategies.push(developerQuery);
    }
    
    // Strategy 2: Multiple genre matching
    if (currentGame.genres && currentGame.genres.length > 0) {
      // Use up to 3 genres for better matching
      const genresList = currentGame.genres.slice(0, 3).map(g => g.slug).join(',');
      const genreQuery = axios.get<GamesResponse>(`${BASE_URL}/games`, {
        params: {
          key: API_KEY,
          genres: genresList,
          page: 1,
          page_size: 15,
          ordering: '-rating'
        }
      });
      searchStrategies.push(genreQuery.then(response => response.data));
    }
    
    // Strategy 3: Similar release year games with same primary genre
    if (currentGame.released && currentGame.genres && currentGame.genres.length > 0) {
      const releaseYear = new Date(currentGame.released).getFullYear();
      const yearStart = `${releaseYear - 2}-01-01`;
      const yearEnd = `${releaseYear + 2}-12-31`;
      
      const timeframeQuery = axios.get<GamesResponse>(`${BASE_URL}/games`, {
        params: {
          key: API_KEY,
          genres: currentGame.genres[0].slug,
          dates: `${yearStart},${yearEnd}`,
          page: 1,
          page_size: 12,
          ordering: '-rating'
        }
      });
      searchStrategies.push(timeframeQuery.then(response => response.data));
    }
    
    // Strategy 4: Platform-specific similar games
    if (currentGame.platforms && currentGame.platforms.length > 0) {
      // Get platform IDs (use first few platforms)
      const platformIds = currentGame.platforms.slice(0, 2).map(p => p.platform.id).join(',');
      const platformQuery = axios.get<GamesResponse>(`${BASE_URL}/games`, {
        params: {
          key: API_KEY,
          platforms: platformIds,
          genres: currentGame.genres?.[0]?.slug,
          page: 1,
          page_size: 10,
          ordering: '-rating'
        }
      });
      searchStrategies.push(platformQuery.then(response => response.data));
    }
    
    // Execute all search strategies in parallel
    const results = await Promise.allSettled(searchStrategies);
    
    // Step 2: Collect and deduplicate all games
    const allSimilarGames: Game[] = [];
    const gameIds = new Set<number>();
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        result.value.results.forEach((game: Game) => {
          // Exclude the current game and avoid duplicates
          if (game.id !== currentGame.id && !gameIds.has(game.id)) {
            gameIds.add(game.id);
            allSimilarGames.push(game);
          }
        });
        console.log(`Strategy ${index + 1} found ${result.value.results.length} games`);
      } else {
        console.warn(`Strategy ${index + 1} failed:`, result.reason);
      }
    });
    
    // Step 3: Calculate similarity scores for more intelligent ranking
    const scoredGames = allSimilarGames.map(game => {
      let similarityScore = 0;
      
      // Genre similarity (highest weight)
      if (currentGame.genres && game.genres) {
        const currentGenreSlugs = currentGame.genres.map(g => g.slug);
        const gameGenreSlugs = game.genres.map(g => g.slug);
        const genreOverlap = currentGenreSlugs.filter(slug => gameGenreSlugs.includes(slug));
        similarityScore += genreOverlap.length * 3; // 3 points per matching genre
      }
      
      // Developer similarity
      if (currentGame.developers && game.developers) {
        const currentDevs = currentGame.developers.map(d => d.name);
        const gameDevs = game.developers.map(d => d.name);
        const devOverlap = currentDevs.some(dev => gameDevs.includes(dev));
        if (devOverlap) similarityScore += 5; // 5 points for same developer
      }
      
      // Release date proximity (within 3 years gets points)
      if (currentGame.released && game.released) {
        const currentYear = new Date(currentGame.released).getFullYear();
        const gameYear = new Date(game.released).getFullYear();
        const yearDiff = Math.abs(currentYear - gameYear);
        if (yearDiff <= 3) {
          similarityScore += 3 - yearDiff; // More points for closer years
        }
      }
      
      // Rating similarity (prefer games with similar ratings)
      const ratingDiff = Math.abs(currentGame.rating - game.rating);
      if (ratingDiff <= 0.5) similarityScore += 2;
      else if (ratingDiff <= 1.0) similarityScore += 1;
      
      // Platform overlap
      if (currentGame.platforms && game.platforms) {
        const currentPlatforms = currentGame.platforms.map(p => p.platform.id);
        const gamePlatforms = game.platforms.map(p => p.platform.id);
        const platformOverlap = currentPlatforms.filter(id => gamePlatforms.includes(id));
        similarityScore += platformOverlap.length * 0.5; // 0.5 points per shared platform
      }
      
      return {
        ...game,
        similarityScore
      };
    });
    
    // Step 4: Sort by similarity score and return top results
    const sortedSimilarGames = scoredGames
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 8); // Get top 8 most similar games
    
    console.log('Similar games found and scored:', sortedSimilarGames.map(g => ({
      name: g.name,
      score: g.similarityScore
    })));
    
    // Remove the similarityScore property before returning
    return sortedSimilarGames.map(({ ...game }) => game);
    
  } catch (error) {
    console.error('Error fetching similar games:', error);
    
    // Fallback: if our advanced algorithm fails, use simple genre-based search
    if (currentGame.genres && currentGame.genres.length > 0) {
      try {
        const fallbackResponse = await axios.get<GamesResponse>(`${BASE_URL}/games`, {
          params: {
            key: API_KEY,
            genres: currentGame.genres[0].slug,
            page: 1,
            page_size: 8,
            ordering: '-rating'
          }
        });
        
        return fallbackResponse.data.results.filter(game => game.id !== currentGame.id);
      } catch (fallbackError) {
        console.error('Fallback similar games search also failed:', fallbackError);
        return [];
      }
    }
    
    return [];
  }
};

// Keep the old function for backward compatibility but mark it as deprecated
export const getRelatedGames = async (genre: string): Promise<GamesResponse> => {
  console.warn('getRelatedGames is deprecated, use getSimilarGames instead');
  try {
    const response = await axios.get<GamesResponse>(`${BASE_URL}/games`, {
      params: {
        key: API_KEY,
        genres: genre,
        page_size: 8,
        ordering: '-rating'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching related games for genre ${genre}:`, error);
    throw error;
  }
};

export const getGenres = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/genres`, {
      params: {
        key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};

export const getPlatforms = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/platforms`, {
      params: {
        key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching platforms:', error);
    throw error;
  }
};