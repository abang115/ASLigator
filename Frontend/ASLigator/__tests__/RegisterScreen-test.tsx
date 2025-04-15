import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockBack, mockNav } from '../__mocks__/ExpoMocks';
import '../__mocks__/FirebaseMocks'

import RegisterScreen from '@/app/RegisterScreen';
import { createUserWithEmailAndPassword } from '@react-native-firebase/auth';

describe('<RegisterScreen/>', () => {
  // Reset navigation before each test
  beforeEach(() => {
    mockNav.mockReset();
  });

  // Test if components are rendering correctly
  test('Components renders correctly on Register', () => {
    const { getByTestId } = render(<RegisterScreen />);

    expect(getByTestId('back')).toBeTruthy()
    expect(getByTestId('header')).toHaveTextContent('Register');
    expect(getByTestId('login')).toHaveTextContent('Log In!');
    expect(getByTestId('first')).toHaveProp('placeholder', 'Ex: Jane');
    expect(getByTestId('last')).toHaveProp('placeholder', 'Ex: Doe');
    expect(getByTestId('email')).toHaveProp('placeholder', 'example@email.com');
    expect(getByTestId('password')).toHaveProp('placeholder', 'Minimum 6 characters');
    expect(getByTestId('confirm')).toHaveProp('placeholder', 'Re-enter password');
    expect(getByTestId('registerButton')).toHaveTextContent('Register');
  });

  // Test if able to successfully navigate to login
  test('Successfully navigate to register screen', async () => {
    const { getByTestId } = render(<RegisterScreen />);

    fireEvent.press(getByTestId('login'))

    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledWith('/LoginScreen');
    });
  });

  // Test if able to successfully go back to splash screen
  test('Successfully navigate back to splash screen', async () => {
    const { getByTestId } = render(<RegisterScreen />);
  
    fireEvent.press(getByTestId('back'))
  
    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });
  });

  // Test if able to successfully register
  test('Successfully register and navigate to home screen', async () => {
    const { getByTestId } = render(<RegisterScreen />);
  
    fireEvent.changeText(getByTestId('first'), "testing");
    expect(getByTestId('first').props.value).toBe('testing');

    fireEvent.changeText(getByTestId('last'), "tester");
    expect(getByTestId('last').props.value).toBe('tester');

    fireEvent.changeText(getByTestId('email'), "test@example.com");
    expect(getByTestId('email').props.value).toBe('test@example.com');
  
    fireEvent.changeText(getByTestId('password'), "password123");
    expect(getByTestId('password').props.value).toBe('password123');

    fireEvent.changeText(getByTestId('confirm'), "password123");
    expect(getByTestId('confirm').props.value).toBe('password123');
  
    fireEvent.press(getByTestId('registerButton'))
  
    await waitFor(() => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          "test@example.com",
          "password123"
        );

        expect(mockNav).toHaveBeenCalledWith('/HomeScreen');
    });
  });

  // Test if register fails when no text is entered and proper error messages are displayed
  test('Successfully register and navigate to home screen', async () => {
    const { getByTestId, findByText } = render(<RegisterScreen />);

    fireEvent.press(getByTestId('registerButton'));
    expect(await findByText('First name is required.')).toBeTruthy();
    expect(await findByText('Last name is required.')).toBeTruthy();
    expect(await findByText('Email is required.')).toBeTruthy();
    expect(await findByText('Password is required.')).toBeTruthy();
    expect(await findByText('Please confirm your password.')).toBeTruthy();
  
    await waitFor(() => {
        expect(mockNav).toHaveBeenCalledTimes(0);
    });
  });

  // Test if register fails when email format is incorrect
  test('Fail to login on incorrect email format', async () => {
    const { getByTestId, findByText } = render(<RegisterScreen />);
  
    fireEvent.changeText(getByTestId('first'), "testing");
    expect(getByTestId('first').props.value).toBe('testing');
    
    fireEvent.changeText(getByTestId('last'), "tester");
    expect(getByTestId('last').props.value).toBe('tester');
    
    fireEvent.changeText(getByTestId('email'), "test");
    expect(getByTestId('email').props.value).toBe('test');
    
    fireEvent.changeText(getByTestId('password'), "testing");
    expect(getByTestId('password').props.value).toBe('testing');
  
    fireEvent.changeText(getByTestId('confirm'), "testing");
    expect(getByTestId('confirm').props.value).toBe('testing');
    
    fireEvent.press(getByTestId('registerButton'))
    expect(await findByText('Invalid email address.')).toBeTruthy();
    
    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledTimes(0);
    });
  });

  // Test if register fails when password less than 6 characters is entered
  test('Fail to login on incorrect password format', async () => {
    const { getByTestId, findByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByTestId('first'), "testing");
    expect(getByTestId('first').props.value).toBe('testing');
  
    fireEvent.changeText(getByTestId('last'), "tester");
    expect(getByTestId('last').props.value).toBe('tester');
  
    fireEvent.changeText(getByTestId('email'), "test@example.com");
    expect(getByTestId('email').props.value).toBe('test@example.com');
  
    fireEvent.changeText(getByTestId('password'), "test");
    expect(getByTestId('password').props.value).toBe('test');

    fireEvent.changeText(getByTestId('confirm'), "test");
    expect(getByTestId('confirm').props.value).toBe('test');
  
    fireEvent.press(getByTestId('registerButton'))
    expect(await findByText('Minimum 6 characters required.')).toBeTruthy();
  
    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledTimes(0);
    });
  });

  // Test if register fails when passwords do not match
  test('Fail to login on incorrect password format', async () => {
    const { getByTestId, findByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByTestId('first'), "testing");
    expect(getByTestId('first').props.value).toBe('testing');
  
    fireEvent.changeText(getByTestId('last'), "tester");
    expect(getByTestId('last').props.value).toBe('tester');
  
    fireEvent.changeText(getByTestId('email'), "test@example.com");
    expect(getByTestId('email').props.value).toBe('test@example.com');
  
    fireEvent.changeText(getByTestId('password'), "testing");
    expect(getByTestId('password').props.value).toBe('testing');

    fireEvent.changeText(getByTestId('confirm'), "tester");
    expect(getByTestId('confirm').props.value).toBe('tester');
  
    fireEvent.press(getByTestId('registerButton'))
    expect(await findByText('Passwords do not match.')).toBeTruthy();
  
    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledTimes(0);
    });
  });
});
