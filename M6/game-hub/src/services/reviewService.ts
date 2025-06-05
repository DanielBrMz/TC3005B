import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Review, CreateReviewData } from '../types/review';

export const reviewService = {
  // Create a new review
  async createReview(userId: string, userName: string, userAvatar: string | undefined, reviewData: CreateReviewData): Promise<Review> {
    try {
      const reviewsCollection = collection(db, 'reviews');
      
      const docRef = await addDoc(reviewsCollection, {
        gameId: reviewData.gameId,
        userId,
        userName,
        userAvatar: userAvatar || '',
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        id: docRef.id,
        gameId: reviewData.gameId,
        userId,
        userName,
        userAvatar,
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review');
    }
  },

  // Get reviews for a specific game
  async getGameReviews(gameId: number): Promise<Review[]> {
    try {
      const reviewsCollection = collection(db, 'reviews');
      const q = query(
        reviewsCollection,
        where('gameId', '==', gameId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const reviews: Review[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reviews.push({
          id: doc.id,
          gameId: data.gameId,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar || '',
          rating: data.rating,
          reviewText: data.reviewText,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
        });
      });

      return reviews;
    } catch (error) {
      console.error('Error fetching game reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  },

  // Update an existing review
  async updateReview(reviewId: string, updates: { rating?: number; reviewText?: string }): Promise<void> {
    try {
      const reviewDoc = doc(db, 'reviews', reviewId);
      await updateDoc(reviewDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('Failed to update review');
    }
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const reviewDoc = doc(db, 'reviews', reviewId);
      await deleteDoc(reviewDoc);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error('Failed to delete review');
    }
  },

  // Check if user has already reviewed a game
  async hasUserReviewed(userId: string, gameId: number): Promise<Review | null> {
    try {
      const reviewsCollection = collection(db, 'reviews');
      const q = query(
        reviewsCollection,
        where('userId', '==', userId),
        where('gameId', '==', gameId)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        gameId: data.gameId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar || '',
        rating: data.rating,
        reviewText: data.reviewText,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()
      };
    } catch (error) {
      console.error('Error checking user review:', error);
      return null;
    }
  }
};