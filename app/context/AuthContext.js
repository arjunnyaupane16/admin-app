import { createContext, useState, useEffect } from 'react';
import { getItem, setItem, deleteItem } from './storageHelper'; // adjust path as needed

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      const token = await getItem('admin_token');
      if (token === 'logged_in') {
        setIsAuthenticated(true);
      }
    };
    loadAuth();
  }, []);

  const login = async (username, password) => {
    if (username === 'Admindriftyandswifty' && password === 'driftandsip@123') {
      await setItem('admin_token', 'logged_in');
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const logout = async () => {
    await deleteItem('admin_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
