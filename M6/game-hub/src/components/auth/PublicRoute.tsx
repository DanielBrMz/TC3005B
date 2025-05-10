import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Loader2 } from "lucide-react";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = "/",
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "#66c0f4",
          gap: "1rem",
        }}
      >
        <Loader2
          size={36}
          className="spinning"
          style={{
            animation: "spin 1s linear infinite",
          }}
        />
        <p>Loading...</p>
      </div>
    );
  }

  if (currentUser) {
    // User is already logged in, redirect them away from auth pages
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
