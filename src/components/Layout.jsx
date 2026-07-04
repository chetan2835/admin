import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Moon, Sun } from 'lucide-react';

export default function Layout() {
  const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ position: 'relative' }}>
        <button 
          onClick={toggleTheme}
          className="btn btn-outline"
          style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            right: '2rem', 
            zIndex: 100,
            padding: '0.5rem',
            borderRadius: '50%'
          }}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <Outlet />
      </main>
    </div>
  );
}
