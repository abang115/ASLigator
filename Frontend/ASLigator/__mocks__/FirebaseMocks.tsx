export const mockSignIn = jest.fn().mockResolvedValue({user: { uid: 123 }});
export const mockCreateUser = jest.fn().mockResolvedValue({user: { uid: 123 }});
export const mockSignOut = jest.fn();
export const mockReset = jest.fn();

jest.mock('@react-native-firebase/auth', () => ({
    getAuth: () => ({}),
    signInWithEmailAndPassword: mockSignIn,
    createUserWithEmailAndPassword: mockCreateUser,
    signOut: mockSignOut,
    sendPasswordResetEmail: mockReset,
}));

jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: () => ({}),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'janedoe@test.com',
      profilePicture: null,
      voiceSetting: 'en-au-x-aub-network',
      speedSetting: 1,
      pitchSetting: 1,
    }),
  }),
  updateDoc: jest.fn(),
}));

jest.mock('@react-native-firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  putFile: jest.fn(),
  getDownloadURL: jest.fn(),
}));
  