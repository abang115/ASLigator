import { render } from '@testing-library/react-native';

import RegisterScreen from '@/app/RegisterScreen';

jest.mock("@expo/vector-icons", () => ({
    Ionicons: "",
}));

jest.mock("@react-native-firebase/auth", () => ({
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: { uid: "mocked-uid-123", email: "test@example.com" },
    }),
  }));
  
  jest.mock("@react-native-firebase/database", () => ({
    ref: jest.fn(() => ({
      set: jest.fn().mockResolvedValue(null),
    })),
  }));
  
  jest.mock("@react-native-firebase/firestore", () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn().mockResolvedValue(null),
      })),
    })),
  }));

describe('<RegisterScreen/>', () => {
  test('Text renders correctly on Index', () => {
    const { getByText } = render(<RegisterScreen />);

    getByText('Already have an account?');
  });
});
