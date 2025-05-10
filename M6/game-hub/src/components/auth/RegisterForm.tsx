import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import GoogleIcon from "./GoogleIcon";
import "./LoginForm.css";

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      await register(
        formData.email,
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim()
      );
      navigate("/");
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      const errorMessage = errorObj.message?.includes("auth/email-already-in-use")
        ? "An account with this email already exists"
        : errorObj.message?.includes("auth/weak-password")
        ? "Password is too weak"
        : errorObj.message?.includes("auth/invalid-email")
        ? "Invalid email address"
        : errorObj.message || "Registration failed. Please try again.";
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
      navigate("/");
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

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: "Weak", color: "#e74c3c" };
    if (strength <= 3) return { strength, text: "Fair", color: "#f39c12" };
    if (strength <= 4) return { strength, text: "Good", color: "#27ae60" };
    return { strength, text: "Strong", color: "#27ae60" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join Game Hub and discover amazing games
          </p>
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
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                <User
                  size={16}
                  style={{ display: "inline", marginRight: "0.5rem" }}
                />
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First name"
                className={`form-input ${errors.firstName ? "error" : ""}`}
                disabled={loading || googleLoading}
              />
              {errors.firstName && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.firstName}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                <User
                  size={16}
                  style={{ display: "inline", marginRight: "0.5rem" }}
                />
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last name"
                className={`form-input ${errors.lastName ? "error" : ""}`}
                disabled={loading || googleLoading}
              />
              {errors.lastName && (
                <div className="error-message">
                  <AlertCircle size={14} />
                  {errors.lastName}
                </div>
              )}
            </div>
          </div>

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
                placeholder="Create a password"
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

            {formData.password && (
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "4px",
                    backgroundColor: "#2a475e",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                      backgroundColor: passwordStrength.color,
                      transition: "all 0.3s ease",
                    }}
                  />
                </div>
                <span
                  style={{ color: passwordStrength.color, fontWeight: "500" }}
                >
                  {passwordStrength.text}
                </span>
              </div>
            )}

            {errors.password && (
              <div className="error-message">
                <AlertCircle size={14} />
                {errors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <Lock
                size={16}
                style={{ display: "inline", marginRight: "0.5rem" }}
              />
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={`form-input ${
                  errors.confirmPassword ? "error" : ""
                }`}
                style={{ paddingRight: "2.5rem" }}
                disabled={loading || googleLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {formData.confirmPassword &&
              formData.password === formData.confirmPassword && (
                <div className="success-message">
                  <CheckCircle size={14} />
                  Passwords match
                </div>
              )}

            {errors.confirmPassword && (
              <div className="error-message">
                <AlertCircle size={14} />
                {errors.confirmPassword}
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
                Creating account...
              </>
            ) : (
              "Create Account"
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
              Signing up...
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
