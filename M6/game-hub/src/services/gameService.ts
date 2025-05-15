import axios from 'axios';
import type { GamesResponse, Game } from '../types/game';

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

export const searchGames = async (query: string, page = 1, pageSize = 20): Promise<GamesResponse> => {
  try {
    const response = await axios.get<GamesResponse>(`${BASE_URL}/games`, {
      params: {
        key: API_KEY,
        search: query,
        page,
        page_size: pageSize
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching games:', error);
    throw error;
  }
};

export const getGameById = async (id: number): Promise<Game> => {
  try {
    const response = await axios.get<Game>(`${BASE_URL}/games/${id}`, {
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