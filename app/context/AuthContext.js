import * as SecureStore from 'expo-secure-store';
import { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      const token = await SecureStore.getItemAsync('admin_token');
      if (token === 'logged_in') {
        setIsAuthenticated(true);
      }
    };
    loadAuth();
  }, []);

  const login = async (username, password) => {
    if (username === 'Admindriftyandswifty' && password === 'driftandsip@123') {
      await SecureStore.setItemAsync('admin_token', 'logged_in');
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('admin_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
