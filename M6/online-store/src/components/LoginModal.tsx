import { useState } from "react";
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
} from "../services/authenticationService";
import "../App.css";
export const LoginModal = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Invalid email or password");
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      await registerWithEmail(email, password, displayName);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Registration failed. Email might be in use.");
    }
  };
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Google sign-in failed");
    }
  };
  return (
    <div className="login-modal-backdrop" onClick={onClose}>
      <div
        className="login-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="login-modal-header">
          <h2>{isRegistering ? "Register" : "Login"}</h2>
          <button className="login-modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        {error && <div className="login-modal-error">{error}</div>}
        <form onSubmit={isRegistering ? handleRegister : handleEmailLogin}>
          <div className="login-modal-form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-modal-form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login-modal-actions">
            <button type="submit" className="login-modal-submit-btn">
              {isRegistering ? "Register" : "Login"}
            </button>
          </div>
        </form>
        <button onClick={handleGoogleLogin} className="login-modal-google-btn">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-
Google_%22G%22_logo.svg.png"
            alt="Google logo"
            className="login-modal-google-icon"
          />
          Sign in with Google
        </button>
        <div className="login-modal-footer">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="login-modal-toggle-btn"
          >
            {isRegistering
              ? "Already have an account? Login"
              : "Need an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};
