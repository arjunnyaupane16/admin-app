import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const getItem = async (key) => {
  if (isWeb) return Promise.resolve(localStorage.getItem(key));
  return SecureStore.getItemAsync(key);
};

export const setItem = async (key, value) => {
  if (isWeb) return Promise.resolve(localStorage.setItem(key, value));
  return SecureStore.setItemAsync(key, value);
};

export const deleteItem = async (key) => {
  if (isWeb) return Promise.resolve(localStorage.removeItem(key));
  return SecureStore.deleteItemAsync(key);
};
