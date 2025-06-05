export interface SavedGames {
  played: number[];
  queued: number[];
  wishlist: number[];
}

export interface SavedItemsContextType {
  savedGames: SavedGames;
  loading: boolean;
  // Game functions
  addToPlayed: (gameId: number) => Promise<void>;
  removeFromPlayed: (gameId: number) => Promise<void>;
  addToQueued: (gameId: number) => Promise<void>;
  removeFromQueued: (gameId: number) => Promise<void>;
  addToWishlist: (gameId: number) => Promise<void>;
  removeFromWishlist: (gameId: number) => Promise<void>;
  // Check functions
  isInPlayed: (gameId: number) => boolean;
  isInQueued: (gameId: number) => boolean;
  isInWishlist: (gameId: number) => boolean;
  // Utility functions
  refreshSavedItems: () => Promise<void>;
}