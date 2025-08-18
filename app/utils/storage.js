import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const storage = {
  getItem: async (key) => {
    if (isWeb) return Promise.resolve(localStorage.getItem(key));
    return SecureStore.getItemAsync(key);
  },
  
  setItem: async (key, value) => {
    if (isWeb) return Promise.resolve(localStorage.setItem(key, value));
    return SecureStore.setItemAsync(key, value);
  },
  
  deleteItem: async (key) => {
    if (isWeb) return Promise.resolve(localStorage.removeItem(key));
    return SecureStore.deleteItemAsync(key);
  }
};

export const { getItem, setItem, deleteItem } = storage;
export default storage;
