import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockNav } from '../__mocks__/ExpoMocks'

import Index from '@/app/index';

// Test if components are rendering correctly
describe('<Index/>', () => {
  test('Text renders correctly on Index', () => {
    const { getByText, getByTestId } = render(<Index />);

    getByText('ASLigator');
    expect(getByTestId('Login')).toHaveTextContent('Login');
    expect(getByTestId('Register')).toHaveTextContent('Create Account');
  });

    // Test if able to successfully navigate to login screen
    test('Successfully navigate to login screen', async () => {
      const { getByTestId } = render(<Index />);
  
      fireEvent.press(getByTestId('Login'))
  
      await waitFor(() => {
        expect(mockNav).toHaveBeenCalledWith('/LoginScreen');
      });
    });

    // Test if able to successfully navigate to register screen
    test('Successfully navigate to register screen', async () => {
      const { getByTestId } = render(<Index />);
  
      fireEvent.press(getByTestId('Register'))
  
      await waitFor(() => {
        expect(mockNav).toHaveBeenCalledWith('/RegisterScreen');
      });
    });
});
