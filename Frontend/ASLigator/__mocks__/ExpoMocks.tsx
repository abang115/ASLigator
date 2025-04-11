import type { ViewProps } from 'react-native';

/* Mock global alerts */
global.alert = jest.fn();

/* Mock icons */
jest.mock("@expo/vector-icons", () => ({
    Ionicons: "",
}));

/* Mock page navigation and back navigation */
export const mockNav = jest.fn();
export const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    navigate: mockNav,
    back: mockBack,
  }),
}));

/* Mock expo camera */
interface MockCameraViewProps extends ViewProps {
  children?: React.ReactNode;
  testID?: string;
}
jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockCameraView = React.forwardRef(function MockCameraView(
    { children, testID }: MockCameraViewProps,
    ref: React.Ref<any>
  ) {
    React.useImperativeHandle(ref, () => ({
      recordAsync: jest.fn().mockResolvedValue({ uri: 'test-uri' }),
      stopRecording: jest.fn(),
    }));
  
    return <View testID={testID}>{children}</View>;
  });

  return {
    CameraView: MockCameraView,
    CameraType: { back: 'back' },
    useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
    useMicrophonePermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
  };
});

/* Mock axios function */
jest.mock('axios');

/* Mock useFocusEffect function */
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: any) => callback()
}));

/* Mock expo speech */
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
}));