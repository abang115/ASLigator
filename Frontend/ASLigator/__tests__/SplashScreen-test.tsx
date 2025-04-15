import { render } from '@testing-library/react-native';
import '../__mocks__/ExpoMocks'

import Index from '@/app/index';

describe('<Index/>', () => {
  test('Text renders correctly on Index', () => {
    const { getByText, getByTestId } = render(<Index />);

    getByText('ASLigator');
    expect(getByTestId('Login')).toHaveTextContent('Login');
    expect(getByTestId('Register')).toHaveTextContent('Create Account');
  });
});
