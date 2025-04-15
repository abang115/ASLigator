import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockBack, mockLaunchImage} from '../__mocks__/ExpoMocks';
import { mockSignOut } from '../__mocks__/FirebaseMocks';

import ProfileScreen from '@/app/ProfileScreen';

describe('<ProfileScreen/>', () => {
  // Reset navigation before each test
  beforeEach(() => {
    jest.clearAllMocks()
  });

  // Test if components are rendering correctly
  test('Components renders correctly on Profile', () => {
    const { getByTestId } = render(<ProfileScreen />);

    expect(getByTestId('back')).toBeTruthy();
    expect(getByTestId('profile')).toBeTruthy();
    expect(getByTestId('header')).toHaveTextContent('Profile');
    expect(getByTestId('first')).toHaveTextContent('First Name: ');
    expect(getByTestId('last')).toHaveTextContent('Last Name: ');
    expect(getByTestId('email')).toHaveTextContent('Email: ');
    expect(getByTestId('signOut')).toBeTruthy();
  });
  
  // Test if able to successfully go back to home screen
  test('Successfully navigate back to splash screen', async () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('back'))

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });
  });

  // Test if able to successfully sign out
  test('Successfully sign out', async () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('signOut'))

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  // Test if able to successfully interact with image picker
  test('Successfully sign out', async () => {
    const { getByTestId } = render(<ProfileScreen />);

    fireEvent.press(getByTestId('profile'))

    await waitFor(() => {
      expect(mockLaunchImage).toHaveBeenCalled();
    });
  });
});
