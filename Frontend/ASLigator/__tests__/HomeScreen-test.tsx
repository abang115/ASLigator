import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockNav, mockRecordAsync, mockStopRecording } from '../__mocks__/ExpoMocks';
import '../__mocks__/FirebaseMocks'
import * as Speech from 'expo-speech';

import HomeScreen from '@/app/HomeScreen';

describe('<HomeScreen/>', () => {

  // Reset navigation before each test
  beforeEach(() => {
    jest.clearAllMocks()
  });

  // Test if components are rendering correctly
  test('Components renders correctly on Register', () => {
      const { getByTestId } = render(<HomeScreen />);

      expect(getByTestId('settings')).toBeTruthy()
      expect(getByTestId('profile')).toBeTruthy()
      expect(getByTestId('text')).toBeTruthy()
      expect(getByTestId('camera')).toBeTruthy()
      expect(getByTestId('start')).toBeTruthy()
      expect(getByTestId('speech')).toBeTruthy()
  });

  // Test if able to successfully navigate to settings
  test('Components renders correctly on Register', async () => {
    const { getByTestId } = render(<HomeScreen />);
    
    fireEvent.press(getByTestId('settings'))
    
    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledWith('/SettingsScreen');
    });
  });

  // Test if able to successfully navigate to profile
  test('Components renders correctly on Register', async () => {
    const { getByTestId } = render(<HomeScreen />);
    
    fireEvent.press(getByTestId('profile'))
    
    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledWith('/ProfileScreen');
    });
  });

  // Test if pressing TTS button activates expo speech
  test('Components renders correctly on Register', async () => {
    const { getByTestId } = render(<HomeScreen />);
    
    fireEvent.press(getByTestId('speech'))
    
    await waitFor(() => {
      expect(Speech.speak).toHaveBeenCalled();
    });
  });

  // Test if pressing start button activates recording
  test('Components renders correctly on Register', async () => {
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId('start'))
    
    await waitFor(() => {
      expect(mockRecordAsync).toHaveBeenCalled();
    });
  });

  // Test if pressing start button activates recording
  test('Components renders correctly on Register', async () => {
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId('start'))

    await waitFor(() => {
      expect(getByTestId('stop')).toBeTruthy();
    });

    fireEvent.press(getByTestId('stop'));
    
    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled();
    });
  });
});
