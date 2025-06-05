import React, {
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { savedItemsService } from "../services/savedItemsService";
import type { SavedGames, SavedItemsContextType } from "../types/savedItems";
import { SavedItemsContext } from "../hooks/useSavedItems";



interface SavedItemsProviderProps {
  children: ReactNode;
}

export const SavedItemsProvider: React.FC<SavedItemsProviderProps> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [savedGames, setSavedGames] = useState<SavedGames>({
    played: [],
    queued: [],
    wishlist: [],
  });
  const [loading, setLoading] = useState(true);

  // Load saved items when user changes
  useEffect(() => {
    if (currentUser) {
      loadSavedItems();
    } else {
      // Clear saved items when user logs out
      setSavedGames({
        played: [],
        queued: [],
        wishlist: [],
      });
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const loadSavedItems = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const savedGamesData = await savedItemsService.getUserSavedGames(
        currentUser.uid
      );
      setSavedGames(savedGamesData);
    } catch (error) {
      console.error("Error loading saved items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Game management functions
  const addToPlayed = async (gameId: number) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      await savedItemsService.addGameToList(currentUser.uid, gameId, "played");

      // Remove from queued if it exists there (game completed)
      if (savedGames.queued.includes(gameId)) {
        await savedItemsService.removeGameFromList(
          currentUser.uid,
          gameId,
          "queued"
        );
      }

      // Update local state
      setSavedGames((prev) => ({
        ...prev,
        played: [...prev.played, gameId],
        queued: prev.queued.filter((id) => id !== gameId),
      }));
    } catch (error) {
      console.error("Error adding to played:", error);
      throw error;
    }
  };

  const removeFromPlayed = async (gameId: number) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      await savedItemsService.removeGameFromList(
        currentUser.uid,
        gameId,
        "played"
      );
      setSavedGames((prev) => ({
        ...prev,
        played: prev.played.filter((id) => id !== gameId),
      }));
    } catch (error) {
      console.error("Error removing from played:", error);
      throw error;
    }
  };

  const addToQueued = async (gameId: number) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      await savedItemsService.addGameToList(currentUser.uid, gameId, "queued");
      setSavedGames((prev) => ({
        ...prev,
        queued: [...prev.queued, gameId],
      }));
    } catch (error) {
      console.error("Error adding to queued:", error);
      throw error;
    }
  };

  const removeFromQueued = async (gameId: number) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      await savedItemsService.removeGameFromList(
        currentUser.uid,
        gameId,
        "queued"
      );
      setSavedGames((prev) => ({
        ...prev,
        queued: prev.queued.filter((id) => id !== gameId),
      }));
    } catch (error) {
      console.error("Error removing from queued:", error);
      throw error;
    }
  };

  const addToWishlist = async (gameId: number) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      await savedItemsService.addGameToList(
        currentUser.uid,
        gameId,
        "wishlist"
      );
      setSavedGames((prev) => ({
        ...prev,
        wishlist: [...prev.wishlist, gameId],
      }));
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  };

  const removeFromWishlist = async (gameId: number) => {
    if (!currentUser) throw new Error("User not authenticated");

    try {
      await savedItemsService.removeGameFromList(
        currentUser.uid,
        gameId,
        "wishlist"
      );
      setSavedGames((prev) => ({
        ...prev,
        wishlist: prev.wishlist.filter((id) => id !== gameId),
      }));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  };

  // Check functions
  const isInPlayed = (gameId: number): boolean =>
    savedGames.played.includes(gameId);
  const isInQueued = (gameId: number): boolean =>
    savedGames.queued.includes(gameId);
  const isInWishlist = (gameId: number): boolean =>
    savedGames.wishlist.includes(gameId);

  const refreshSavedItems = async () => {
    await loadSavedItems();
  };

  const value: SavedItemsContextType = {
    savedGames,
    loading,
    addToPlayed,
    removeFromPlayed,
    addToQueued,
    removeFromQueued,
    addToWishlist,
    removeFromWishlist,
    isInPlayed,
    isInQueued,
    isInWishlist,
    refreshSavedItems,
  };

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
};



