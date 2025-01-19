import { useState } from "react";
import { OrderCard } from "../components/OrderCard";
import { useOrders } from "../context/OrderContext";
import { LoadingSpinner } from "../components/LoadingSpinner.tsx";
import { Link } from "react-router-dom";
// Add date to each order to match OrderCard requirements

export const Orders = () => {
  const { orders, loading, error } = useOrders();
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "processing" | "completed" | "cancelled"
  >("all");

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>Your Orders</h1>
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>Your Orders</h1>
        <div className="order-tabs">
          <button
            className={activeTab === "all" ? "active" : ""}
            onClick={() => setActiveTab("all")}
          >
            All Orders
          </button>
          <button
            className={activeTab === "processing" ? "active" : ""}
            onClick={() => setActiveTab("processing")}
          >
            Processing
          </button>
          <button
            className={activeTab === "completed" ? "active" : ""}
            onClick={() => setActiveTab("completed")}
          >
            Completed
          </button>
          <button
            className={activeTab === "cancelled" ? "active" : ""}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled
          </button>
        </div>
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>No {activeTab === "all" ? "" : activeTab} orders found</p>
              <Link to="/products" className="shop-link">
                Continue Shopping
              </Link>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  id: order.id,
                  date: new Date().toISOString(),
                  items: order.items.map((item) => ({
                    id: Number(item.productId) || 0,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image || "",
                  })),
                  total: order.total,
                  status:
                    order.status === "processing"
                      ? "shipped"
                      : order.status === "shipped"
                      ? "delivered"
                      : "pending",
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
