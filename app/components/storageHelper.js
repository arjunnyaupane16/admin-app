import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const getItem = async (key) => {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.localStorage.getItem(key));
  } else {
    return SecureStore.getItemAsync(key);
  }
};

export const setItem = async (key, value) => {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  } else {
    return SecureStore.setItemAsync(key, value);
  }
};

export const deleteItem = async (key) => {
  if (Platform.OS === 'web') {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  } else {
    return SecureStore.deleteItemAsync(key);
  }
};
