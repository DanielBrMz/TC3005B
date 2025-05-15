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

export interface GamesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Game[];
}