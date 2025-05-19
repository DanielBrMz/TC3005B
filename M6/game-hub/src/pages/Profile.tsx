import React from 'react';
import './Profile.css';

const Profile: React.FC = () => {
  // TODO: Fetch user data from an API or context
  const user = {
    username: "Daniel Barreras",
    email: "danielbarreras@gmail.com",
    memberSince: "2022-01-15",
    favoritePlatform: "PC",
    favoriteGenre: "RPG"
  };

  return (
    <div className="profile-page">
      <h1>Your Profile</h1>
      <p className="profile-intro">Manage your gaming profile and preferences!</p>
      
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user.username.charAt(0)}</span>
          </div>
          <div className="profile-username">{user.username}</div>
        </div>
        
        <div className="profile-details">
          <div className="profile-row">
            <div className="profile-label">Email</div>
            <div className="profile-value">{user.email}</div>
          </div>
          <div className="profile-row">
            <div className="profile-label">Member Since</div>
            <div className="profile-value">{new Date(user.memberSince).toLocaleDateString()}</div>
          </div>
          <div className="profile-row">
            <div className="profile-label">Favorite Platform</div>
            <div className="profile-value">{user.favoritePlatform}</div>
          </div>
          <div className="profile-row">
            <div className="profile-label">Favorite Genre</div>
            <div className="profile-value">{user.favoriteGenre}</div>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="profile-button">Edit Profile</button>
          <button className="profile-button secondary">Change Password</button>
        </div>
      </div>
      
      <div className="profile-section">
        <h2>Achievement Stats</h2>
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
        </div>
      </div>
    </div>
  );
};

export default Profile;