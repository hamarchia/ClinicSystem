import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set background only for the login page
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page'); // Clean up when leaving login page
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("Trying to login");
      const response = await axios.post('http://localhost:5000/api/auth/login', { username, password });
      const { token, role, userId } = response.data;
      localStorage.setItem('token', token);
      setUser({ role, userId });
      navigate(role === 'doctor' ? '/doctor' : '/compounder');
    } catch (error) {
      console.log(error);
      setError(true);
    }
  };

  return (
    <div className="login-container">
      <h2>LOGIN</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          className={`login-input ${error ? 'error' : ''}`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className={`login-input ${error ? 'error' : ''}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error-message">Invalid credentials</p>}
        <button type="submit" className="login-button">LOGIN</button>
      </form>
    </div>
  );
};

export default Login;
