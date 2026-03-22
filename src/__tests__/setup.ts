// Setup global mocks e configuração para testes Jest
// Mocks de APIs e storage para ambiente de teste

// Define __DEV__ global
(global as any).__DEV__ = true;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
}));

// Mock axios/api
jest.mock('../config/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Suprimir console logs durante testes (opcional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
};
