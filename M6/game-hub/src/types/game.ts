export interface Platform {
  id: number;
  name: string;
  slug: string;
}

export interface PlatformDetail {
  platform: Platform;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Developer {
  id: number;
  name: string;
  slug: string;
}

export interface Publisher {
  id: number;
  name: string;
  slug: string;
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  background_image: string;
  rating: number;
  released: string;
  platforms: PlatformDetail[];
  genres: Genre[];
}

// Extended interface for detailed game information
export interface GameDetail extends Game {
  description?: string;
  description_raw?: string;
  metacritic?: number;
  website?: string;
  developers?: Developer[];
  publishers?: Publisher[];
  esrb_rating?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Screenshot {
  id: number;
  image: string;
  width: number;
  height: number;
}

export interface ScreenshotsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Screenshot[];
}

export interface GamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Game[];
}