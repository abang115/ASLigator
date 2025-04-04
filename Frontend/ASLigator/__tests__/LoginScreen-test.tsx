import { render } from '@testing-library/react-native';

import LoginScreen from '@/app/LoginScreen';

jest.mock("@expo/vector-icons", () => ({
    Ionicons: "",
}));

jest.mock('@react-native-firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(() => 
      Promise.resolve({ user: { uid: '123', email: 'test@example.com' } })
    ),
}));

describe('<LoginScreen/>', () => {
  test('Text renders correctly on Index', () => {
    const { getByTestId } = render(<LoginScreen />);

    expect(getByTestId('header')).toHaveTextContent('Login');
  });
});
