import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useCart } from "../context/CartContext";
import { calculateShipping, ShippingRate } from "../services/shippingService";
import {
  createOrder,
  updateOrderPaymentStatus,
} from "../services/orderService";
import { PostalCodeLookup } from "../components/PostalCodeLookup";
import { CartItemCard } from "../components/CartItemCard";
import { Product } from "../types/products.ts";
import { CartItem } from "../types/cart.ts";
import { Order } from "../types/order.ts";
import { PayPalButtons } from "@paypal/react-paypal-js";

export const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearUserCart } = useCart();
  const { products, loading: productsLoading } = useProducts();
  const [cartItems, setCartItems] = useState<Array<{
    product: Product;
    cartItem: CartItem;
  }> | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [shippingOptions, setShippingOptions] = useState<ShippingRate[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(
    null
  );
  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    postalCode: "",
    state: "",
    municipality: "",
    colonia: "",
  });
  const [isShippingSelected, setIsShippingSelected] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);

  // Merge cart items with product data
  useEffect(() => {
    if (cart && products) {
      const items = cart.items
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return product ? { product, cartItem: item } : null;
        })
        .filter(Boolean) as Array<{
        product: Product;
        cartItem: CartItem;
      }>;
      setCartItems(items);
    }
  }, [cart, products]);

  // Calculate shipping when postal code changes
  useEffect(() => {
    if (address.postalCode && cartItems) {
      const totalWeight = cartItems.reduce(
        (sum, { product }) => sum + (product.weight || 1),
        0
      );
      calculateShipping({
        postalCode: address.postalCode,
        weight: totalWeight,
      }).then((rates) => {
        setShippingOptions(rates);
        if (rates.length > 0) {
          // Select the cheapest option by default
          const cheapest = rates.reduce((prev, current) =>
            prev.amount < current.amount ? prev : current
          );
          setSelectedShipping(cheapest);
          setShippingCost(cheapest.amount);
          setIsShippingSelected(true);
        }
      });
    }
  }, [address.postalCode, cartItems]);

  useEffect(() => {
    const isValid =
      address.fullName.trim() !== "" &&
      address.street.trim() !== "" &&
      isShippingSelected;
    setIsAddressValid(isValid);
  }, [address.fullName, address.street, isShippingSelected]);

  const handleShippingChange = (option: ShippingRate) => {
    setSelectedShipping(option);
    setShippingCost(option.amount);
  };

  const calculateSubtotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, { product, cartItem }) => {
      return total + product.price * cartItem.quantity;
    }, 0);
  };

  const onCreateOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: (calculateSubtotal() + shippingCost).toFixed(2),
          },
        },
      ],
    });
  };

  const onApproveOrder = async (data: any, actions: any) => {
    return actions.order.capture().then(async (details: any) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (!cartItems || !selectedShipping) {
        throw new Error("Cart items or shipping method not selected");
      }

      const subtotal = calculateSubtotal();
      const total = subtotal + shippingCost;

      // Prepare order items
      const orderItems = cartItems.map(({ product, cartItem }) => ({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      }));

      // Create the order in Firestore first
      const orderId = await createOrder(user.uid, {
        customerName: address.fullName,
        items: orderItems,
        shippingAddress: {
          fullName: address.fullName,
          street: address.street,
          city: address.city,
          postalCode: address.postalCode,
          state: address.state,
          municipality: address.municipality,
          colonia: address.colonia,
        },
        shippingMethod: {
          carrier: selectedShipping.carrier,
          service: selectedShipping.service,
          cost: selectedShipping.amount,
          estimatedDelivery: new Date(selectedShipping.estimatedDeliveryDate),
        },
        payment: {
          method: "paypal",
          amount: total,
          transactionId: "",
          status: "pending",
        },
        subtotal: subtotal,
        total: total,
        status: "processing",
      } as Order);

      // Update the order in Firestore with payment details
      await updateOrderPaymentStatus(
        user.uid,
        orderId,
        details.id,
        details.status === "COMPLETED" ? "completed" : "failed"
      );

      await clearUserCart();
      navigate(`/orders/${orderId}`);
    });
  };

  if (cartLoading || productsLoading) {
    return <div>Loading...</div>;
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <Link to="/products" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <form className="checkout-container">
        <div className="shipping-form">
          <h2>Shipping Information</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={address.fullName}
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={address.street}
              onChange={(e) =>
                setAddress({ ...address, street: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Postal Code</label>
            <PostalCodeLookup
              onSelect={(data) => {
                setAddress((prev) => ({
                  ...prev,
                  ...data,
                  postalCode: data.postalCode || prev.postalCode,
                }));
              }}
              initialValue={address.postalCode}
            />
            {address.postalCode && (
              <div className="address-preview">
                {address.colonia}, {address.city}, {address.municipality},{" "}
                {address.state}
              </div>
            )}
          </div>
          {shippingOptions.length > 0 && (
            <div className="shipping-options">
              <h3>Shipping Options</h3>
              {shippingOptions.map((option, index) => {
                // Determine carrier class for styling
                const carrierClass = option.carrier.toLowerCase();
                return (
                  <div
                    key={index}
                    className={`shipping-option ${carrierClass} ${
                      selectedShipping?.service === option.service
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      id={`shipping-${index}`}
                      name="shipping"
                      checked={selectedShipping?.service === option.service}
                      onChange={() => handleShippingChange(option)}
                    />
                    <label htmlFor={`shipping-${index}`}>
                      <div className="shipping-option-content">
                        <img
                          src={
                            carrierClass === "fedex"
                              ? "https://e7.pngegg.com/pngimages/115/184/png-clipart-logo-business-brand-fedex-design-activity-room-text-trademark.png"
                              : "https://www.citypng.com/public/uploads/preview/ups-delivery-company-logo-symbol-hd-png-701751694777602klzxvtwtqk.png"
                          }
                          alt={option.carrier}
                          className="shipping-carrier-logo"
                        />
                        <div className="shipping-details">
                          <div className="shipping-service">
                            <span>{option.service}</span>
                          </div>
                          <span className="shipping-price">
                            ${option.amount.toFixed(2)}
                          </span>
                          <div className="shipping-estimate">
                            Estimated delivery:{" "}
                            {new Date(
                              option.estimatedDeliveryDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="order-summary">
          <h2>Your Order</h2>
          <div className="order-items">
            {cartItems.map(({ product, cartItem }) => (
              <CartItemCard
                key={product.id}
                product={product}
                cartItem={cartItem}
              />
            ))}
          </div>
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total:</span>
              <span>${(calculateSubtotal() + shippingCost).toFixed(2)}</span>
            </div>
          </div>
          {isAddressValid ? (
            <div className="paypal-buttons-container">
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={(data, actions) => onCreateOrder(data, actions)}
                onApprove={(data, actions) => onApproveOrder(data, actions)}
              />
            </div>
          ) : (
            <div className="payment-requirements-message">
              {!address.fullName.trim() && (
                <div className="requirement">• Please enter your full name</div>
              )}
              {!address.street.trim() && (
                <div className="requirement">
                  • Please enter your street address
                </div>
              )}
              {!isShippingSelected && (
                <div className="requirement">
                  • Please select a shipping option
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
