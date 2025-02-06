import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login.jsx';
import DoctorDashboard from './DoctorDashboard.jsx';
import CompounderDashboard from './CompounderDashboard.jsx';
import { jwtDecode } from "jwt-decode";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ role: decoded.role, userId: decoded.userId });
      } catch (error) {
        console.error("Token decoding error", error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        {user && (
          <>
            <Route path="/doctor" element={<DoctorDashboard user={user} setUser={setUser} />} />
            <Route path="/compounder" element={<CompounderDashboard user={user} setUser={setUser} />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;