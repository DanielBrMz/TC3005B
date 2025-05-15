import React from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  // This would be connected to a backend in a real app
  const playedGames = [
    { id: 1, name: "The Witcher 3", playTime: 120, lastPlayed: "2023-05-15" },
    { id: 2, name: "Cyberpunk 2077", playTime: 45, lastPlayed: "2023-05-10" },
    { id: 3, name: "Elden Ring", playTime: 78, lastPlayed: "2023-05-18" }
  ];

  return (
    <div className="dashboard-page">
      <h1>Your Game Dashboard</h1>
      <p className="dashboard-intro">Track your gaming activity and see your stats!</p>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Games</h3>
          <p className="stat-value">{playedGames.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Play Time</h3>
          <p className="stat-value">{playedGames.reduce((sum, game) => sum + game.playTime, 0)} hours</p>
        </div>
        <div className="stat-card">
          <h3>Last Played</h3>
          <p className="stat-value">{new Date(playedGames[0].lastPlayed).toLocaleDateString()}</p>
        </div>
      </div>
      
      <h2>Recently Played Games</h2>
      <div className="recent-games">
        <table className="games-table">
          <thead>
            <tr>
              <th>Game</th>
              <th>Play Time</th>
              <th>Last Played</th>
            </tr>
          </thead>
          <tbody>
            {playedGames.map(game => (
              <tr key={game.id}>
                <td>{game.name}</td>
                <td>{game.playTime} hours</td>
                <td>{new Date(game.lastPlayed).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;