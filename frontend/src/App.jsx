import { useState } from 'react';
import Login from './Login';
import Tasks from './Tasks';
import './App.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  function handleLogin(newToken) {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
  }

  return token ? <Tasks onLogout={handleLogout} /> : <Login onLogin={handleLogin} />;
}