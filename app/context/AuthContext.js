import { router } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { deleteItem, getItem, setItem } from '../utils/storage';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuthStatus = async () => {
    try {
      const [storedAuth, storedUser] = await Promise.all([
        getItem('authToken'),
        getItem('userData')
      ]);

      console.log('checkAuthStatus - storedAuth:', storedAuth);
      console.log('checkAuthStatus - storedUser:', storedUser);

      if (storedAuth && storedUser) {
        try {
          // Ensure we're working with a proper string
          const userString = typeof storedUser === 'string' ? storedUser : JSON.stringify(storedUser);
          const parsedUser = JSON.parse(userString);
          
          // Ensure we only set serializable data
          const safeUserData = JSON.parse(JSON.stringify(parsedUser));
          
          setUser(safeUserData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to process user data:', error);
          // Clear invalid data
          await Promise.all([
            deleteItem('authToken'),
            deleteItem('userData')
          ]);
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

        // Ensure we're only storing serializable data
        const serializedUser = JSON.parse(JSON.stringify(userData));
        
        await setItem('authToken', 'dummy-auth-token');
        await setItem('userData', JSON.stringify(serializedUser));

        // Update state with serialized data
        setIsAuthenticated(true);
        setUser(serializedUser);

        console.log('Login successful:', serializedUser);
        
        // Let the AuthLayout handle the navigation
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

export { AuthContext, AuthProvider };

export default {
  AuthContext,
  AuthProvider
};
