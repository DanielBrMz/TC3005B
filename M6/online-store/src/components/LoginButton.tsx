import { useState } from "react";
import { LoginModal } from "./LoginModal";
export const LoginButton = () => {
  const [, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  return (
    <>
      <button
        className="login-button"
        onClick={() => {
          setIsMenuOpen(false);
          setShowLoginModal(true);
        }}
      >
        Login
      </button>
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
};
