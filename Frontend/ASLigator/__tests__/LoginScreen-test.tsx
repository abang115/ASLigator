import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockBack, mockNav } from '../__mocks__/ExpoMocks';
import '../__mocks__/FirebaseMocks'
import { signInWithEmailAndPassword } from '@react-native-firebase/auth';

import LoginScreen from '@/app/LoginScreen';

describe('<LoginScreen/>', () => {
  // Reset navigation before each test
  beforeEach(() => {
    mockNav.mockReset();
  });

  // Test if components are rendering correctly
  test('Components renders correctly on Login', () => {
    const { getByTestId } = render(<LoginScreen />);

    expect(getByTestId('header')).toHaveTextContent('Login');
    expect(getByTestId('back')).toBeTruthy()
    expect(getByTestId('register')).toHaveTextContent('Register!');
    expect(getByTestId('loginButton')).toHaveTextContent('Login');
    expect(getByTestId('forgot')).toHaveTextContent('Forgot Password?');
    expect(getByTestId('email')).toHaveProp('placeholder', 'example@email.com');
    expect(getByTestId('password')).toHaveProp('placeholder', 'Minimum 6 characters');
  });

  // Test if able to successfully navigate to register
  test('Successfully navigate to register screen', async () => {
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.press(getByTestId('register'))

    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledWith('/RegisterScreen');
    });
  });

  // Test if able to successfully navigate to forgot password
  test('Successfully navigate to forgot password screen', async () => {
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.press(getByTestId('forgot'))

    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledWith('/ForgotScreen');
    });
  });
  
  // Test if able to successfully go back to splash screen
  test('Successfully navigate back to splash screen', async () => {
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.press(getByTestId('back'))

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });
  });

  // Test if able to successfully login
  test('Successfully login and navigate to home screen', async () => {
    const { getByTestId } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('email'), "test@example.com");
    expect(getByTestId('email').props.value).toBe('test@example.com');

    fireEvent.changeText(getByTestId('password'), "password123");
    expect(getByTestId('password').props.value).toBe('password123');

    fireEvent.press(getByTestId('loginButton'))

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "password123"
      );

      expect(mockNav).toHaveBeenCalledWith('/HomeScreen');
    });
  });

  // Test if login fails when no text is entered and proper error messages are displayed
  test('Fail to login if no text entered', async () => {
    const { getByTestId, findByText } = render(<LoginScreen />);

    fireEvent.press(getByTestId('loginButton'))
    expect(await findByText('Email is required.')).toBeTruthy();
    expect(await findByText('Password is required.')).toBeTruthy();

    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledTimes(0);
    });
  });

  // Test if login fails when email format is incorrect
  test('Fail to login on incorrect email format', async () => {
    const { getByTestId, findByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('email'), "test");
    expect(getByTestId('email').props.value).toBe('test');

    fireEvent.changeText(getByTestId('password'), "testing");
    expect(getByTestId('password').props.value).toBe('testing');

    fireEvent.press(getByTestId('loginButton'))
    expect(await findByText('Invalid email address.')).toBeTruthy();

    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledTimes(0);
    });
  });

  // Test if login fails when password less than 6 characters is entered
  test('Fail to login on incorrect password format', async () => {
    const { getByTestId, findByText } = render(<LoginScreen />);

    fireEvent.changeText(getByTestId('email'), "test@example.com");
    expect(getByTestId('email').props.value).toBe('test@example.com');

    fireEvent.changeText(getByTestId('password'), "test");
    expect(getByTestId('password').props.value).toBe('test');

    fireEvent.press(getByTestId('loginButton'))
    expect(await findByText('Minimum 6 characters required.')).toBeTruthy();

    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledTimes(0);
    });
  });
});
