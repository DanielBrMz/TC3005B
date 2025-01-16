import { CartItem } from "../types/cart";
import { Product } from "../types/products";

interface CartItemCardProps {
  product: Product;
  cartItem: CartItem;
  onQuantityChange?: (newQuantity: number) => void;
  onRemove?: () => void;
}

export const CartItemCard = ({
  product,
  cartItem,
  onQuantityChange,
  onRemove
}: CartItemCardProps) => {
  return (
    <div className="cart-item-card">
      <div className="cart-item-info">
        <img src={product.image} alt={product.title} className="cart-item-image" />
        <div className="cart-item-details">
          <h3>{product.title}</h3>
          <p>${product.price.toFixed(2)}</p>
        </div>
      </div>
      {onQuantityChange && (
        <div className="cart-quantity-controls">
          <button
            onClick={() => onQuantityChange ? onQuantityChange(cartItem.quantity - 1) : 0}
            disabled={cartItem.quantity <= 1}
          >
            -
          </button>
          <span>{cartItem.quantity}</span>
          <button onClick={() => onQuantityChange ? onQuantityChange(cartItem.quantity + 1) :0}>
            +
          </button>
        </div>
      )}
      <div className="cart-item-total">
        ${(product.price * cartItem.quantity).toFixed(2)}
      </div>
      {onRemove && (
        <button onClick={onRemove} className="cart-remove-item">
          Remove
        </button>
      )}
    </div>
  );
};