import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom/extend-expect';
import { useRemark } from '../src';

describe('useRemark', () => {
  it('should render content', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useRemark());
    act(() => {
      result.current[1]('# header');
    });
    await waitForNextUpdate();
    expect(result.current[0]).toMatchSnapshot();
  });
});
