jest.mock('@react-native-firebase/auth', () => ({
    getAuth: () => ({}),
    signInWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: { uid: 123 },
    }),
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: { uid: 123  },
    }),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: () => ({}),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn(),
}));
  