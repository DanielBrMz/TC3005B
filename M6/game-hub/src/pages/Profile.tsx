import React, { useState } from "react";
import {
  User,
  Mail,
  Edit3,
  Save,
  X,
  Camera,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./Profile.css";

const Profile: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    bio: currentUser?.bio || "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(null);
    setErrors({});
    // Reset form data to current user data
    setFormData({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      bio: currentUser?.bio || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setMessage(null);
    // Reset form data to current user data
    setFormData({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      bio: currentUser?.bio || "",
    });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setMessage(null);

      await updateUserProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim(),
      });

      setIsEditing(false);
      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "An error occurred while updating profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const getInitials = () => {
    const firstName = currentUser?.firstName || "";
    const lastName = currentUser?.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <AlertCircle size={48} />
          <h2>Profile Not Found</h2>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Your Profile</h1>
        <p className="profile-intro">
          Manage your gaming profile and preferences!
        </p>
      </div>

      {message && (
        <div className={`profile-message ${message.type}`}>
          {message.type === "success" ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          {message.text}
        </div>
      )}

      <div className="profile-container">
        <div className="profile-header-section">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="avatar-image"
                />
              ) : (
                <span className="avatar-initials">{getInitials()}</span>
              )}
            </div>
            <button className="avatar-edit-button" disabled={isEditing}>
              <Camera size={16} />
              Change Photo
            </button>
          </div>

          <div className="profile-info-section">
            <div className="profile-name">
              {currentUser.firstName} {currentUser.lastName}
            </div>
            <div className="profile-email">{currentUser.email}</div>
            <div className="profile-member-since">
              Member since{" "}
              {currentUser.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button className="profile-button primary" onClick={handleEdit}>
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  className="profile-button primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  className="profile-button secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-details">
          <h3 className="section-title">Personal Information</h3>

          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  <User size={16} />
                  First Name
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`form-input ${
                        errors.firstName ? "error" : ""
                      }`}
                      disabled={loading}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        {errors.firstName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-value">{currentUser.firstName}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  <User size={16} />
                  Last Name
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.lastName ? "error" : ""}`}
                      disabled={loading}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <div className="error-message">
                        <AlertCircle size={14} />
                        {errors.lastName}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-value">{currentUser.lastName}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <div className="form-value email-readonly">
                {currentUser.email}
                <span className="readonly-note">Email cannot be changed</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio" className="form-label">
                <Edit3 size={16} />
                Bio
              </label>
              {isEditing ? (
                <div>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className={`form-textarea ${errors.bio ? "error" : ""}`}
                    disabled={loading}
                    placeholder="Tell us about yourself and your gaming interests..."
                    rows={4}
                    maxLength={500}
                  />
                  <div className="character-count">
                    {formData.bio.length}/500 characters
                  </div>
                  {errors.bio && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      {errors.bio}
                    </div>
                  )}
                </div>
              ) : (
                <div className="form-value bio-value">
                  {currentUser.bio || (
                    <span className="placeholder-text">No bio added yet</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="section-title">Gaming Statistics</h2>
        <div className="achievement-stats">
          <div className="achievement-card">
            <h3>Total Achievements</h3>
            <p className="achievement-value">124</p>
          </div>
          <div className="achievement-card">
            <h3>Rare Achievements</h3>
            <p className="achievement-value">32</p>
          </div>
          <div className="achievement-card">
            <h3>Completion Rate</h3>
            <p className="achievement-value">68%</p>
          </div>
          <div className="achievement-card">
            <h3>Hours Played</h3>
            <p className="achievement-value">1,247</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
