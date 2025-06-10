import React, { useState } from "react";
import { Star, MessageSquare, X, AlertCircle } from "lucide-react";
import { reviewService } from "../../services/reviewService";
import { useAuth } from "../../hooks/useAuth";
import type { CreateReviewData, Review } from "../../types/review";
import "./ReviewForm.css";

interface ReviewFormProps {
  gameId: number;
  existingReview?: Review;
  onReviewSubmitted: (review: Review) => void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  gameId,
  existingReview,
  onReviewSubmitted,
  onCancel,
}) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(
    existingReview?.reviewText || ""
  );
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;
  const maxCharacters = 1000;
  const remainingCharacters = maxCharacters - reviewText.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setError("You must be logged in to write a review");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (reviewText.trim().length < 10) {
      setError("Review must be at least 10 characters long");
      return;
    }

    if (reviewText.length > maxCharacters) {
      setError(`Review must be less than ${maxCharacters} characters`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isEditing && existingReview) {
        // Update existing review
        await reviewService.updateReview(existingReview.id, {
          rating,
          reviewText: reviewText.trim(),
        });

        // Create updated review object for callback
        const updatedReview: Review = {
          ...existingReview,
          rating,
          reviewText: reviewText.trim(),
          updatedAt: new Date(),
        };

        onReviewSubmitted(updatedReview);
      } else {
        // Create new review
        const reviewData: CreateReviewData = {
          gameId,
          rating,
          reviewText: reviewText.trim(),
        };

        const review = await reviewService.createReview(
          currentUser.uid,
          `${currentUser.firstName} ${currentUser.lastName}`,
          currentUser.photoURL,
          reviewData
        );

        onReviewSubmitted(review);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRatingText = (rating: number): string => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Great";
      case 5:
        return "Excellent";
      default:
        return "Select a rating";
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="review-form">
      <div className="review-form-header">
        <h3 className="review-form-title">
          <MessageSquare size={20} />
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="close-form-button"
          aria-label="Close review form"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            <Star size={16} />
            Rating
          </label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button ${
                  star <= displayRating ? "active" : ""
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={24}
                  fill={star <= displayRating ? "currentColor" : "none"}
                />
              </button>
            ))}
            <span className="rating-text">{getRatingText(displayRating)}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reviewText" className="form-label">
            <MessageSquare size={16} />
            Your Review
          </label>
          <textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this game... What did you like or dislike? Would you recommend it to others?"
            className="review-textarea"
            maxLength={maxCharacters}
            disabled={loading}
          />
          <div
            className={`character-count ${
              remainingCharacters < 50
                ? remainingCharacters < 0
                  ? "error"
                  : "warning"
                : ""
            }`}
          >
            {remainingCharacters} characters remaining
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="review-button secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="review-button primary"
            disabled={loading || rating === 0 || reviewText.trim().length < 10}
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                {isEditing ? "Updating..." : "Submitting..."}
              </>
            ) : (
              <>
                <MessageSquare size={16} />
                {isEditing ? "Update Review" : "Submit Review"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
