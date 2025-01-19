import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getOrderById } from "../services/orderService";
import { Order, OrderItem } from "../types/order";
import { formatCurrency, formatDate } from "../util/format.ts";
import { LoadingSpinner } from "../components/LoadingSpinner.tsx";

const OrderItemCard = ({ item }: { item: OrderItem }) => {
  return (
    <div className="order-item-card">
      <div className="item-image">
        <img src={item.image} alt={item.title} className="cart-item-image" />
      </div>
      <div className="item-details">
        <h3 className="item-title">
          <Link to={`/products/${item.productId}`}>{item.title}</Link>
        </h3>
        <div className="item-meta">
          <span className="item-price">{formatCurrency(item.price)}</span>
          <span className="item-quantity">Qty: {item.quantity}</span>
          <span className="item-total">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) return;
      try {
        setLoading(true);
        const orderData = await getOrderById(user.uid, orderId);
        setOrder(orderData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [user, orderId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Order</h2>
        <p>{error}</p>
        <Link to="/orders" className="back-link">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="not-found-container">
        <h2>Order Not Found</h2>
        <p>We couldn't find the order you're looking for.</p>
        <Link to="/orders" className="back-link">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      <div className="order-header">
        <h1>Order #{order.id}</h1>
        <div className="order-meta">
          <span className="order-date"></span>
          <span className={`order-status ${order.status}`}>{order.status}</span>
        </div>
      </div>
      <div className="order-sections">
        {/* Order Summary */}
        <section className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-grid">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{formatCurrency(order.shippingMethod.cost)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
            <div className="summary-row">
              <span>Payment Method</span>
              <span className="payment-method">
                {order.payment.method === "paypal" ? (
                  <>
                    <img
                      src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png"
                      alt="PayPal"
                      className="payment-logo"
                    />
                    {order.payment.transactionId && (
                      <span className="transaction-id">
                        Transaction: {order.payment.transactionId}
                      </span>
                    )}
                  </>
                ) : (
                  "Credit Card"
                )}
              </span>
            </div>
            <div className="summary-row">
              <span>Payment Status</span>
              <span className={`payment-status ${order.payment.status}`}>
                {order.payment.status}
              </span>
            </div>
          </div>
        </section>
        {/* Shipping Information */}
        <section className="shipping-info">
          <h2>Shipping Information</h2>
          <div className="shipping-details">
            <div className="shipping-address">
              <h3>Shipping Address</h3>
              <p>{order.customerName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
            <div className="shipping-method">
              <h3>Shipping Method</h3>
              <div className="shipping-method-details">
                <div className="carrier-info">
                  {order.shippingMethod.carrier === "FedEx" ? (
                    <img
                      src="https://e7.pngegg.com/pngimages/115/184/png-clipart-logo-business-brand-fedex-design-activity-room-text-trademark.png"
                      alt="FedEx"
                      className="carrier-logo"
                    />
                  ) : (
                    <img
                      src="https://www.citypng.com/public/uploads/preview/ups-delivery-company-logo-symbol-hd-png-701751694777602klzxvtwtqk.png"
                      alt="UPS"
                      className="carrier-logo"
                    />
                  )}
                  <span>{order.shippingMethod.service}</span>
                </div>
                <p>
                  Estimated delivery:{" "}
                  {formatDate(order.shippingMethod.estimatedDelivery)}
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Order Items */}
        <section className="order-items">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.items.map((item: OrderItem) => (
              <OrderItemCard key={item.productId} item={item} />
            ))}
          </div>
        </section>
      </div>
      <div className="order-actions">
        <Link to="/orders" className="back-button">
          Back to Orders
        </Link>
        {order.status === "processing" && (
          <Link className="contact-support" to="/products">
            Continue Shopping
          </Link>
        )}
      </div>
    </div>
  );
};
