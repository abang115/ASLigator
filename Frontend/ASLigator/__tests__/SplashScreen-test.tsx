import { render } from '@testing-library/react-native';

import Index from '@/app/index';

jest.mock("@expo/vector-icons", () => ({
    Ionicons: "",
}));

describe('<Index/>', () => {
  test('Text renders correctly on Index', () => {
    const { getByText } = render(<Index />);

    getByText('ASLigator');
  });
});
