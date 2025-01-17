import { useState, useCallback } from "react";
import { useConfirmation } from "../hooks/useConfirmation";
import { logout } from "../services/authenticationService";
import "../App.css";
export const LogoutButton = () => {
  const { confirm, Confirmation } = useConfirmation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show error to user
    } finally {
      setIsLoggingOut(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout]);
  const showLogoutConfirmation = useCallback(() => {
    confirm({
      title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      confirmText: isLoggingOut ? "Logging out..." : "Logout",
      cancelText: "Cancel",
      variant: "warning",
      onConfirm: handleLogoutConfirm,
    });
  }, [confirm, handleLogoutConfirm, isLoggingOut]);
  return (
    <>
      <button
        onClick={showLogoutConfirmation}
        className="logout-button"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>
      <Confirmation />
    </>
  );
};
