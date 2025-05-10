import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import GoogleIcon from "./GoogleIcon";
import "./LoginForm.css";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      const errorMessage = errorObj.message?.includes("auth/user-not-found")
        ? "No account found with this email address"
        : errorObj.message?.includes("auth/wrong-password")
        ? "Incorrect password"
        : errorObj.message?.includes("auth/invalid-email")
        ? "Invalid email address"
        : errorObj.message?.includes("auth/user-disabled")
        ? "This account has been disabled"
        : errorObj.message || "Login failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setErrors({});
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      const errorMessage = errorObj.message?.includes("auth/popup-closed-by-user")
        ? "Sign-in was cancelled"
        : errorObj.message?.includes("auth/popup-blocked")
        ? "Popup was blocked. Please allow popups and try again."
        : errorObj.message || "Google sign-in failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your Game Hub account</p>
        </div>

        {errors.general && (
          <div
            className="error-message"
            style={{ marginBottom: "1rem", justifyContent: "center" }}
          >
            <AlertCircle size={16} />
            {errors.general}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className={`form-input ${errors.email ? "error" : ""}`}
              disabled={loading || googleLoading}
            />
            {errors.email && (
              <div className="error-message">
                <AlertCircle size={14} />
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className={`form-input ${errors.password ? "error" : ""}`}
                style={{ paddingRight: "2.5rem" }}
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#8f98a0",
                  cursor: "pointer",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                }}
                disabled={loading || googleLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">
                <AlertCircle size={14} />
                {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="auth-button google-button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
        >
          {googleLoading ? (
            <>
              <div className="loading-spinner" />
              Signing in...
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
