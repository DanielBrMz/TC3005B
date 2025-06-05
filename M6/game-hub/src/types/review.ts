export interface Review {
  id: string;
  gameId: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  reviewText: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewData {
  gameId: number;
  rating: number;
  reviewText: string;
}