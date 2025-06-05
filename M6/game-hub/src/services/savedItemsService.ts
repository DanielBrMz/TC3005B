import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { SavedGames } from '../types/savedItems';

export const savedItemsService = {
  // Get user's saved games
  async getUserSavedGames(userId: string): Promise<SavedGames> {
    try {
      const userDoc = doc(db, 'users', userId);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        return {
          played: userData.savedGames?.played || [],
          queued: userData.savedGames?.queued || [],
          wishlist: userData.savedGames?.wishlist || []
        };
      }

      // Return empty arrays if user document doesn't exist or has no saved games
      return {
        played: [],
        queued: [],
        wishlist: []
      };
    } catch (error) {
      console.error('Error fetching saved games:', error);
      throw new Error('Failed to fetch saved games');
    }
  },

  // Add game to a specific list
  async addGameToList(userId: string, gameId: number, listType: keyof SavedGames): Promise<void> {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        [`savedGames.${listType}`]: arrayUnion(gameId)
      });
    } catch (error) {
      console.error(`Error adding game to ${listType}:`, error);
      throw new Error(`Failed to add game to ${listType}`);
    }
  },

  // Remove game from a specific list
  async removeGameFromList(userId: string, gameId: number, listType: keyof SavedGames): Promise<void> {
    try {
      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        [`savedGames.${listType}`]: arrayRemove(gameId)
      });
    } catch (error) {
      console.error(`Error removing game from ${listType}:`, error);
      throw new Error(`Failed to remove game from ${listType}`);
    }
  },

  // Move game between lists (e.g., from queued to played)
  async moveGameBetweenLists(
    userId: string, 
    gameId: number, 
    fromList: keyof SavedGames, 
    toList: keyof SavedGames
  ): Promise<void> {
    try {
      const userDoc = doc(db, 'users', userId);
      
      // Remove from source list and add to destination list in a single operation
      await updateDoc(userDoc, {
        [`savedGames.${fromList}`]: arrayRemove(gameId),
        [`savedGames.${toList}`]: arrayUnion(gameId)
      });
    } catch (error) {
      console.error(`Error moving game from ${fromList} to ${toList}:`, error);
      throw new Error(`Failed to move game from ${fromList} to ${toList}`);
    }
  }
};