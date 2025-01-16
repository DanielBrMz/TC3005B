import { useState } from 'react';
import { useCart } from '../context/CartContext';

interface AddToCartButtonProps {
  productId: string;
  initialQuantity?: number;
  className?: string;
}

export const AddToCartButton = ({
  productId,
  initialQuantity = 1,
  className = ''
}: AddToCartButtonProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (status !== 'idle') return;
    setStatus('loading');
    try {
      await addToCart(productId, quantity);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000); // Reset after 2 seconds
    }
  };

  const buttonClass = `add-to-cart-button ${status !== 'idle' ? status : ''}`;

  return (
    <div className={`add-to-cart-container ${className}`}>
      <div className="quantity-selector">
        <button
          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
          disabled={quantity <= 1 || status !== 'idle'}
        >
          -
        </button>
        <span>{quantity}</span>
        <button
          onClick={() => setQuantity(prev => prev + 1)}
          disabled={status !== 'idle'}
        >
          +
        </button>
      </div>
      <button
        onClick={handleAddToCart}
        className={buttonClass}
        disabled={status !== 'idle'}
      >
        {status === 'loading' ? 'Adding...' :
          status === 'success' ? 'Added!' :
          status === 'error' ? 'Failed' : 'Add to Cart'}
      </button>
    </div>
  );
};