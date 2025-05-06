import axios from "axios";
import type {
  GamesResponse,
  GameDetail,
  ScreenshotsResponse,
} from "../types/game";

const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = "https://api.rawg.io/api";

export const getGames = async (
  page = 1,
  pageSize = 20
): Promise<GamesResponse> => {
  try {
    const response = await axios.get<GamesResponse>(`${BASE_URL}/games`, {
      params: {
        key: API_KEY,
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
};

interface SearchGamesParams {
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
    const params: SearchGamesParams = {
      key: API_KEY,
      search: query,
      page,
      page_size: pageSize,
    };

    // Add optional filters
    if (genres) params.genres = genres;
    if (platforms) params.platforms = platforms;
    if (ordering) params.ordering = ordering;

    const response = await axios.get<GamesResponse>(`${BASE_URL}/games`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching games:", error);
    throw error;
  }
};

export const getGameById = async (id: number): Promise<GameDetail> => {
  try {
    const response = await axios.get<GameDetail>(`${BASE_URL}/games/${id}`, {
      params: {
        key: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching game with id ${id}:`, error);
    throw error;
  }
};

export const getGameScreenshots = async (
  id: number
): Promise<ScreenshotsResponse> => {
  try {
    const response = await axios.get<ScreenshotsResponse>(
      `${BASE_URL}/games/${id}/screenshots`,
      {
        params: {
          key: API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching screenshots for game ${id}:`, error);
    throw error;
  }
};

export const getRelatedGames = async (
  genre: string
): Promise<GamesResponse> => {
  try {
    const response = await axios.get<GamesResponse>(`${BASE_URL}/games`, {
      params: {
        key: API_KEY,
        genres: genre,
        page_size: 8,
        ordering: "-rating",
      },
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
        key: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching genres:", error);
    throw error;
  }
};

export const getPlatforms = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/platforms`, {
      params: {
        key: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching platforms:", error);
    throw error;
  }
};
