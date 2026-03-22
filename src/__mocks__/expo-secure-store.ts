/**
 * Mock for expo-secure-store
 * Used in Jest tests
 */

const store: Record<string, string> = {};

export const setItemAsync = jest.fn(async (key: string, value: string) => {
  store[key] = value;
});

export const getItemAsync = jest.fn(async (key: string) => {
  return store[key] || null;
});

export const deleteItemAsync = jest.fn(async (key: string) => {
  delete store[key];
});

export const removeItemAsync = jest.fn(async (key: string) => {
  delete store[key];
});

export default {
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
  removeItemAsync,
};
