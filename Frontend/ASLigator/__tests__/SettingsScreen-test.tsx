import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockBack } from '../__mocks__/ExpoMocks';
import '../__mocks__/FirebaseMocks'

import SettingsScreen from '@/app/SettingsScreen';

describe('<SettingsScreen/>', () => {
  // Reset navigation before each test
  beforeEach(() => {
    jest.clearAllMocks()
  });

  // Test if components are rendering correctly
  test('Components renders correctly on Settings', () => {
    const { getByTestId } = render(<SettingsScreen />);

    expect(getByTestId('back')).toBeTruthy();
    expect(getByTestId('header')).toHaveTextContent('Settings');
    expect(getByTestId('settingsIcon')).toBeTruthy();
    expect(getByTestId('voiceChange')).toBeTruthy();
    expect(getByTestId('speedChange')).toBeTruthy();
    expect(getByTestId('pitchChange')).toBeTruthy();
    expect(getByTestId('voiceChange').props.selectedValue).toBe("en-au-x-aub-network");
    expect(getByTestId('speedChange').props.selectedValue).toBe(1);
    expect(getByTestId('pitchChange').props.value).toBe(1);
  });
  
  // Test if able to successfully go back to home screen
  test('Successfully navigate back to splash screen', async () => {
    const { getByTestId } = render(<SettingsScreen />);

    fireEvent.press(getByTestId('back'))

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalled();
    });
  });

  // Test if able to successfully interact with picker objects
  test('Successfully interact with picker', async () => {
    const { getByTestId } = render(<SettingsScreen />);

    fireEvent(getByTestId('voiceChange'), 'valueChange', 'en-gb-x-rjs-network')
    fireEvent(getByTestId('speedChange'), 'valueChange', 1.5)
    fireEvent(getByTestId('pitchChange'), 'valueChange', 1.5)
    await waitFor(() => {
      expect(getByTestId('voiceChange').props.selectedValue).toBe("en-gb-x-rjs-network");
      expect(getByTestId('speedChange').props.selectedValue).toBe(1.5);
      expect(getByTestId('pitchChange').props.value).toBe(1.5);
    });
  });
});
