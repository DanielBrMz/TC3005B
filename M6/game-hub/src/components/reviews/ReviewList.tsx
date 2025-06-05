import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Edit3, Trash2 } from "lucide-react";
import { reviewService } from "../../services/reviewService";
import { useAuth } from "../../hooks/useAuth";
import ReviewForm from "./ReviewForm";
import ConfirmDialog from "../ui/ConfirmDialog";
import type { Review } from "../../types/review";
import "./ReviewList.css";

interface ReviewListProps {
  gameId: number;
  gameName: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ gameId, gameName }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    reviewId: string | null;
    loading: boolean;
  }>({
    show: false,
    reviewId: null,
    loading: false,
  });

  // Load reviews when component mounts or gameId changes
  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Check if current user has already reviewed this game
  useEffect(() => {
    if (currentUser) {
      checkUserReview();
    } else {
      setUserReview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, gameId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const gameReviews = await reviewService.getGameReviews(gameId);
      setReviews(gameReviews);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError("Failed to load reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!currentUser) return;

    try {
      const existingReview = await reviewService.hasUserReviewed(
        currentUser.uid,
        gameId
      );
      setUserReview(existingReview);
    } catch (err) {
      console.error("Error checking user review:", err);
    }
  };

  const handleReviewSubmitted = (review: Review) => {
    if (editingReview) {
      // Update existing review in the list
      setReviews((prev) => prev.map((r) => (r.id === review.id ? review : r)));
      setEditingReview(null);
    } else {
      // Add new review to the beginning of the list
      setReviews((prev) => [review, ...prev]);
      setUserReview(review);
    }

    setShowReviewForm(false);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    setDeleteConfirm({ show: true, reviewId, loading: false });
  };

  const confirmDeleteReview = async () => {
    if (!deleteConfirm.reviewId) return;

    try {
      setDeleteConfirm((prev) => ({ ...prev, loading: true }));

      await reviewService.deleteReview(deleteConfirm.reviewId);

      // Remove review from list
      setReviews((prev) => prev.filter((r) => r.id !== deleteConfirm.reviewId));

      // Clear user review if it was the deleted one
      if (userReview && userReview.id === deleteConfirm.reviewId) {
        setUserReview(null);
      }

      setDeleteConfirm({ show: false, reviewId: null, loading: false });
    } catch (err) {
      console.error("Error deleting review:", err);
      setDeleteConfirm((prev) => ({ ...prev, loading: false }));
      // Could add a toast notification here for better UX
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < rating ? "currentColor" : "none"}
      />
    ));
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
        return "";
    }
  };

  const getUserInitials = (userName: string): string => {
    return userName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="reviews-section">
        <div className="reviews-loading">
          <div className="loading-spinner" />
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2 className="reviews-title">
          <MessageSquare size={20} />
          Reviews
          {reviews.length > 0 && (
            <span className="reviews-count">({reviews.length})</span>
          )}
        </h2>

        {currentUser && !userReview && !showReviewForm && (
          <button
            className="write-review-button"
            onClick={() => setShowReviewForm(true)}
          >
            <MessageSquare size={16} />
            Write a Review
          </button>
        )}
      </div>

      {error && (
        <div className="reviews-error">
          <p>{error}</p>
          <button onClick={loadReviews} className="retry-button">
            Try Again
          </button>
        </div>
      )}

      {showReviewForm && (
        <ReviewForm
          gameId={gameId}
          existingReview={editingReview || undefined}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {!error && reviews.length === 0 && !showReviewForm && (
        <div className="no-reviews">
          <MessageSquare size={48} className="no-reviews-icon" />
          <h3>No reviews yet</h3>
          <p>Be the first to share your thoughts about {gameName}!</p>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="review-user-info">
                  <div className="review-avatar">
                    {review.userAvatar ? (
                      <img src={review.userAvatar} alt={review.userName} />
                    ) : (
                      <span className="review-avatar-initials">
                        {getUserInitials(review.userName)}
                      </span>
                    )}
                  </div>
                  <div className="review-user-details">
                    <div className="review-username">{review.userName}</div>
                    <div className="review-date">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="review-rating-display">
                  <div className="review-stars">
                    {renderStars(review.rating)}
                  </div>
                  <span className="review-rating-text">
                    {getRatingText(review.rating)}
                  </span>
                </div>

                {/* Show edit/delete buttons only for the review author */}
                {currentUser && currentUser.uid === review.userId && (
                  <div className="review-actions">
                    <button
                      className="review-action-button edit"
                      onClick={() => handleEditReview(review)}
                      title="Edit review"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="review-action-button delete"
                      onClick={() => handleDeleteReview(review.id)}
                      title="Delete review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="review-content">
                <p className="review-text">{review.reviewText}</p>
                {review.updatedAt > review.createdAt && (
                  <p className="review-updated">
                    Edited {formatDate(review.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteReview}
        onCancel={() =>
          setDeleteConfirm({ show: false, reviewId: null, loading: false })
        }
        loading={deleteConfirm.loading}
        variant="danger"
      />
    </div>
  );
};

export default ReviewList;
