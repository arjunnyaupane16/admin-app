import { router } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { deleteItem, getItem, setItem } from '../utils/storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuthStatus = async () => {
    try {
      const storedAuth = await getItem('authToken');
      const storedUser = await getItem('userData');

      console.log('checkAuthStatus - storedAuth:', storedAuth);
      console.log('checkAuthStatus - storedUser:', storedUser);

      if (storedAuth && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to parse storedUser JSON:', error);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (username === 'Admin' && password === 'admin123') {
        const userData = {
          username,
          role: 'admin',
          lastLogin: new Date().toISOString(),
        };

        await setItem('authToken', 'dummy-auth-token');
        await setItem('userData', JSON.stringify(userData));

        setIsAuthenticated(true);
        setUser(userData);

        console.log('Login successful:', userData);
        return true;
      }

      console.log('Login failed: invalid credentials');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await deleteItem('authToken');
      await deleteItem('userData');
      setIsAuthenticated(false);
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
