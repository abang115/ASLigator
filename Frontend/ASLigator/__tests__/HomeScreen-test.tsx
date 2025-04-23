import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockNav, mockRecordAsync, mockStopRecording, mockSpeak } from '../__mocks__/ExpoMocks';
import '../__mocks__/FirebaseMocks'

import HomeScreen from '@/app/HomeScreen';

describe('<HomeScreen/>', () => {

  // Reset navigation before each test
  beforeEach(() => {
    jest.clearAllMocks()
  });

  // Test if components are rendering correctly
  test('Components renders correctly on Home', () => {
      const { getByTestId } = render(<HomeScreen />);

      expect(getByTestId('settings')).toBeTruthy()
      expect(getByTestId('profile')).toBeTruthy()
      expect(getByTestId('text')).toBeTruthy()
      expect(getByTestId('camera')).toBeTruthy()
      expect(getByTestId('start')).toBeTruthy()
      expect(getByTestId('speech')).toBeTruthy()
  });

  // Test if able to successfully navigate to settings
  test('Navigate to settings', async () => {
    const { getByTestId } = render(<HomeScreen />);
    
    fireEvent.press(getByTestId('settings'))
    
    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledWith('/SettingsScreen');
    });
  });

  // Test if able to successfully navigate to profile
  test('Navigate to profile', async () => {
    const { getByTestId } = render(<HomeScreen />);
    
    fireEvent.press(getByTestId('profile'))
    
    await waitFor(() => {
      expect(mockNav).toHaveBeenCalledWith('/ProfileScreen');
    });
  });

  // Test if pressing TTS button activates expo speech
  test('Text-to-speech button calls function', async () => {
    const { getByTestId } = render(<HomeScreen />);
    
    fireEvent.press(getByTestId('speech'))
    
    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled();
    });
  });

  // Test if pressing start button activates recording
  test('Camera is able to record', async () => {
    const { getByTestId } = render(<HomeScreen />);

    fireEvent.press(getByTestId('start'))
    
    await waitFor(() => {
      expect(mockRecordAsync).toHaveBeenCalled();
    });
  });

  // Test if pressing stop button stops recording
  test('Camera is able to stop recording', async () => {
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
