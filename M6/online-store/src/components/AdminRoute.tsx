import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { JSX } from "react";
export const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user || role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};
