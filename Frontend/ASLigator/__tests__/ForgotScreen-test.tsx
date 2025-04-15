import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockBack } from '../__mocks__/ExpoMocks';
import { mockReset } from '../__mocks__/FirebaseMocks';

import ForgotScreen from '@/app/ForgotScreen';

describe('<ForgotScreen/>', () => {
  // Reset navigation before each test
  beforeEach(() => {
    jest.clearAllMocks()
  });

  // Test if components are rendering correctly
  test('Components renders correctly on Profile', () => {
    const { getByTestId } = render(<ForgotScreen />);

    expect(getByTestId('back')).toBeTruthy();
    expect(getByTestId('header')).toHaveTextContent('Forgot Password');
    expect(getByTestId('info')).toHaveTextContent(
        'Please enter the email associated with your account and follow the instructions sent to reset your password.'
    );
    expect(getByTestId('email')).toHaveProp('placeholder', 'example@email.com');
    expect(getByTestId('reset')).toBeTruthy();
  });
  
  // Test if able to successfully go back to home screen
  test('Successfully navigate back to splash screen', async () => {
    const { getByTestId } = render(<ForgotScreen />);

    fireEvent.press(getByTestId('back'))

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });
  });

  // Test if able to send reset link
  test('Successfully call reset function', async () => {
    const { getByTestId } = render(<ForgotScreen />);

    fireEvent.changeText(getByTestId('email'), 'test@example.com')
    fireEvent.press(getByTestId('reset'))

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();

    });
  });

  // Test if reset fails when no text is entered and proper error messages are displayed
  test('Successfully call reset function', async () => {
    const { getByTestId, findByText } = render(<ForgotScreen />);

    fireEvent.press(getByTestId('reset'))
    expect(await findByText('Email is required.')).toBeTruthy();

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledTimes(0);
    });
  });
});
