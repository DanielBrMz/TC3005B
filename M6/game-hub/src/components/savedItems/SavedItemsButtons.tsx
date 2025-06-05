import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, Heart, Minus, LogIn } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSavedItems } from "../../hooks/useSavedItems";
import "./SavedItemsButtons.css";

interface SavedItemsButtonsProps {
  gameId: number;
  compact?: boolean; // For use in cards vs detailed pages
  showLoginPrompt?: boolean; // Whether to show login prompt when not authenticated
}

const SavedItemsButtons: React.FC<SavedItemsButtonsProps> = ({
  gameId,
  compact = false,
  showLoginPrompt = true,
}) => {
  const { currentUser } = useAuth();
  const {
    isInPlayed,
    isInQueued,
    isInWishlist,
    addToPlayed,
    removeFromPlayed,
    addToQueued,
    removeFromQueued,
    addToWishlist,
    removeFromWishlist,
    loading: savedItemsLoading,
  } = useSavedItems();

  // Local loading states for individual buttons to provide immediate feedback
  const [buttonLoading, setButtonLoading] = useState<{
    played: boolean;
    queued: boolean;
    wishlist: boolean;
  }>({
    played: false,
    queued: false,
    wishlist: false,
  });

  // Track success animations
  const [successAnimation, setSuccessAnimation] = useState<{
    played: boolean;
    queued: boolean;
    wishlist: boolean;
  }>({
    played: false,
    queued: false,
    wishlist: false,
  });

  const handlePlayedClick = async () => {
    if (!currentUser || buttonLoading.played) return;

    try {
      setButtonLoading((prev) => ({ ...prev, played: true }));

      if (isInPlayed(gameId)) {
        await removeFromPlayed(gameId);
      } else {
        await addToPlayed(gameId);
        // Trigger success animation
        setSuccessAnimation((prev) => ({ ...prev, played: true }));
        setTimeout(
          () => setSuccessAnimation((prev) => ({ ...prev, played: false })),
          600
        );
      }
    } catch (error) {
      console.error("Error updating played status:", error);
    } finally {
      setButtonLoading((prev) => ({ ...prev, played: false }));
    }
  };

  const handleQueuedClick = async () => {
    if (!currentUser || buttonLoading.queued) return;

    try {
      setButtonLoading((prev) => ({ ...prev, queued: true }));

      if (isInQueued(gameId)) {
        await removeFromQueued(gameId);
      } else {
        await addToQueued(gameId);
        setSuccessAnimation((prev) => ({ ...prev, queued: true }));
        setTimeout(
          () => setSuccessAnimation((prev) => ({ ...prev, queued: false })),
          600
        );
      }
    } catch (error) {
      console.error("Error updating queued status:", error);
    } finally {
      setButtonLoading((prev) => ({ ...prev, queued: false }));
    }
  };

  const handleWishlistClick = async () => {
    if (!currentUser || buttonLoading.wishlist) return;

    try {
      setButtonLoading((prev) => ({ ...prev, wishlist: true }));

      if (isInWishlist(gameId)) {
        await removeFromWishlist(gameId);
      } else {
        await addToWishlist(gameId);
        setSuccessAnimation((prev) => ({ ...prev, wishlist: true }));
        setTimeout(
          () => setSuccessAnimation((prev) => ({ ...prev, wishlist: false })),
          600
        );
      }
    } catch (error) {
      console.error("Error updating wishlist status:", error);
    } finally {
      setButtonLoading((prev) => ({ ...prev, wishlist: false }));
    }
  };

  // Show login prompt if user is not authenticated
  if (!currentUser) {
    if (!showLoginPrompt) return null;

    return (
      <div className="login-prompt">
        <p className="login-prompt-text">
          Sign in to save games to your library, queue, and wishlist
        </p>
        <Link to="/login" className="login-prompt-button">
          <LogIn size={16} />
          Sign In
        </Link>
      </div>
    );
  }

  // Show loading state while saved items are being loaded
  if (savedItemsLoading) {
    return (
      <div className={`saved-items-buttons ${compact ? "compact" : ""}`}>
        <div className="saved-item-button played inactive">
          <div className="button-loading-spinner" />
          Loading...
        </div>
      </div>
    );
  }

  const playedActive = isInPlayed(gameId);
  const queuedActive = isInQueued(gameId);
  const wishlistActive = isInWishlist(gameId);

  return (
    <div className={`saved-items-buttons ${compact ? "compact" : ""}`}>
      {/* Played Button */}
      <button
        className={`saved-item-button played ${
          !playedActive ? "inactive" : ""
        } ${successAnimation.played ? "success" : ""}`}
        onClick={handlePlayedClick}
        disabled={buttonLoading.played}
        title={playedActive ? "Remove from played games" : "Mark as played"}
      >
        {buttonLoading.played ? (
          <div className="button-loading-spinner" />
        ) : playedActive ? (
          <Minus size={16} />
        ) : (
          <CheckCircle size={16} />
        )}
        {playedActive ? "Played" : "Mark Played"}
      </button>

      {/* Queued Button */}
      <button
        className={`saved-item-button queued ${
          !queuedActive ? "inactive" : ""
        } ${successAnimation.queued ? "success" : ""}`}
        onClick={handleQueuedClick}
        disabled={buttonLoading.queued || playedActive} // Disable if already played
        title={
          playedActive
            ? "Game is already played"
            : queuedActive
            ? "Remove from queue"
            : "Add to queue"
        }
      >
        {buttonLoading.queued ? (
          <div className="button-loading-spinner" />
        ) : queuedActive ? (
          <Minus size={16} />
        ) : (
          <Clock size={16} />
        )}
        {queuedActive ? "Queued" : "Add to Queue"}
      </button>

      {/* Wishlist Button */}
      <button
        className={`saved-item-button wishlist ${
          !wishlistActive ? "inactive" : ""
        } ${successAnimation.wishlist ? "success" : ""}`}
        onClick={handleWishlistClick}
        disabled={buttonLoading.wishlist}
        title={wishlistActive ? "Remove from wishlist" : "Add to wishlist"}
      >
        {buttonLoading.wishlist ? (
          <div className="button-loading-spinner" />
        ) : wishlistActive ? (
          <Minus size={16} />
        ) : (
          <Heart size={16} />
        )}
        {wishlistActive ? "Wishlisted" : "Wishlist"}
      </button>
    </div>
  );
};

export default SavedItemsButtons;
