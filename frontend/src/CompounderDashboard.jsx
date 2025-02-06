import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/logout.css';

const CompounderDashboard = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <div>
      <h2>Compounder Dashboard</h2>
      <p>Welcome, {user.role} (User ID: {user.userId})</p>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default CompounderDashboard;
