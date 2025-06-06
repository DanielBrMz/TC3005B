import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Heart, 
  LogIn
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSavedItems } from '../../contexts/SavedItemsContext';
import './SavedItemsButtons.css';

interface SavedItemsButtonsProps {
  gameId: number;
  compact?: boolean;
  showLoginPrompt?: boolean;
}

const SavedItemsButtons: React.FC<SavedItemsButtonsProps> = ({
  gameId,
  compact = false,
  showLoginPrompt = true
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
    loading: savedItemsLoading
  } = useSavedItems();

  // Local loading states for individual buttons with better UX feedback
  const [buttonLoading, setButtonLoading] = useState<{
    played: boolean;
    queued: boolean;
    wishlist: boolean;
  }>({
    played: false,
    queued: false,
    wishlist: false
  });

  // Success animation states for visual feedback
  const [successAnimation, setSuccessAnimation] = useState<{
    played: boolean;
    queued: boolean;
    wishlist: boolean;
  }>({
    played: false,
    queued: false,
    wishlist: false
  });

  // Helper function to trigger success animation
  const triggerSuccessAnimation = (buttonType: 'played' | 'queued' | 'wishlist') => {
    setSuccessAnimation(prev => ({ ...prev, [buttonType]: true }));
    setTimeout(() => {
      setSuccessAnimation(prev => ({ ...prev, [buttonType]: false }));
    }, 600);
  };

  const handlePlayedClick = async () => {
    if (!currentUser || buttonLoading.played) return;

    try {
      setButtonLoading(prev => ({ ...prev, played: true }));
      
      if (isInPlayed(gameId)) {
        await removeFromPlayed(gameId);
      } else {
        await addToPlayed(gameId);
        triggerSuccessAnimation('played');
      }
    } catch (error) {
      console.error('Error updating played status:', error);
    } finally {
      setButtonLoading(prev => ({ ...prev, played: false }));
    }
  };

  const handleQueuedClick = async () => {
    if (!currentUser || buttonLoading.queued) return;

    try {
      setButtonLoading(prev => ({ ...prev, queued: true }));
      
      if (isInQueued(gameId)) {
        await removeFromQueued(gameId);
      } else {
        await addToQueued(gameId);
        triggerSuccessAnimation('queued');
      }
    } catch (error) {
      console.error('Error updating queued status:', error);
    } finally {
      setButtonLoading(prev => ({ ...prev, queued: false }));
    }
  };

  const handleWishlistClick = async () => {
    if (!currentUser || buttonLoading.wishlist) return;

    try {
      setButtonLoading(prev => ({ ...prev, wishlist: true }));
      
      if (isInWishlist(gameId)) {
        await removeFromWishlist(gameId);
      } else {
        await addToWishlist(gameId);
        triggerSuccessAnimation('wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist status:', error);
    } finally {
      setButtonLoading(prev => ({ ...prev, wishlist: false }));
    }
  };

  // Show login prompt for unauthenticated users
  if (!currentUser) {
    if (!showLoginPrompt) return null;
    
    return (
      <div className="login-prompt">
        <p className="login-prompt-text">
          Sign in to save games to your library and track your gaming journey
        </p>
        <Link to="/login" className="login-prompt-button">
          <LogIn size={16} />
          Sign In to Continue
        </Link>
      </div>
    );
  }

  // Show skeleton loading state while saved items are being loaded
  if (savedItemsLoading) {
    return (
      <div className={`saved-items-buttons ${compact ? 'compact' : ''}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="saved-item-button played inactive" style={{ opacity: 0.5 }}>
            <div className="button-loading-spinner" />
          </div>
        ))}
      </div>
    );
  }

  // Determine current states for each button type
  const playedActive = isInPlayed(gameId);
  const queuedActive = isInQueued(gameId);
  const wishlistActive = isInWishlist(gameId);

  return (
    <div className={`saved-items-buttons ${compact ? 'compact' : ''}`}>
      {/* Played Games Button - Always visible */}
      <button
        className={`saved-item-button played ${playedActive ? 'active' : 'inactive'} ${
          successAnimation.played ? 'success' : ''
        }`}
        onClick={handlePlayedClick}
        disabled={buttonLoading.played}
        aria-label={playedActive ? 'Remove from played games' : 'Mark as played'}
      >
        {buttonLoading.played ? (
          <div className="button-loading-spinner" />
        ) : (
          <CheckCircle size={compact ? 14 : 16} className="button-icon" />
        )}
        {playedActive ? 'Played' : 'Played'}
        <span className="button-tooltip">
          {playedActive ? 'Remove from played games' : 'Mark this game as played'}
        </span>
      </button>

      {/* Queued Games Button - Disabled if already played */}
      <button
        className={`saved-item-button queued ${queuedActive ? 'active' : 'inactive'} ${
          successAnimation.queued ? 'success' : ''
        }`}
        onClick={handleQueuedClick}
        disabled={buttonLoading.queued || playedActive}
        aria-label={
          playedActive 
            ? 'Cannot queue played games' 
            : queuedActive 
            ? 'Remove from queue' 
            : 'Add to play queue'
        }
      >
        {buttonLoading.queued ? (
          <div className="button-loading-spinner" />
        ) : (
          <Clock size={compact ? 14 : 16} className="button-icon" />
        )}
        {queuedActive ? 'Queued' : 'Queue'}
        <span className="button-tooltip">
          {playedActive 
            ? 'Already played - cannot queue' 
            : queuedActive 
            ? 'Remove from play queue' 
            : 'Add to play queue'
          }
        </span>
      </button>

      {/* Wishlist Button - Always available */}
      <button
        className={`saved-item-button wishlist ${wishlistActive ? 'active' : 'inactive'} ${
          successAnimation.wishlist ? 'success' : ''
        }`}
        onClick={handleWishlistClick}
        disabled={buttonLoading.wishlist}
        aria-label={wishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {buttonLoading.wishlist ? (
          <div className="button-loading-spinner" />
        ) : (
          <Heart 
            size={compact ? 14 : 16} 
            className="button-icon"
            fill={wishlistActive ? 'currentColor' : 'none'}
          />
        )}
        {wishlistActive ? 'Wished' : 'Wishlist'}
        <span className="button-tooltip">
          {wishlistActive ? 'Remove from wishlist' : 'Add to wishlist'}
        </span>
      </button>
    </div>
  );
};

export default SavedItemsButtons;