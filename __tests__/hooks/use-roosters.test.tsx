import { renderHook } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useRoosters, useRooster } from '@/hooks/use-roosters';
import { ReactNode } from 'react';

// Mock fetch
global.fetch = jest.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
    {children}
  </SWRConfig>
);

// Helper to wait for async updates
const waitFor = (callback: () => void, timeout = 3000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      try {
        callback();
        clearInterval(interval);
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          reject(error);
        }
      }
    }, 50);
  });
};

describe('useRoosters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch roosters successfully', async () => {
    const mockRoosters = [
      { id: 'R001', breed: 'Kelso', status: 'Available', price: '5000' },
      { id: 'R002', breed: 'Hatch', status: 'Sold', price: '6000' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockRoosters }),
    });

    const { result } = renderHook(() => useRoosters(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.roosters).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.roosters).toEqual(mockRoosters);
    expect(result.current.isError).toBeUndefined();
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useRoosters(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.roosters).toBeUndefined();
    expect(result.current.isError).toBeDefined();
  });

  it('should cache roosters data', async () => {
    const mockRoosters = [
      { id: 'R001', breed: 'Kelso', status: 'Available', price: '5000' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockRoosters }),
    });

    const { result: result1 } = renderHook(() => useRoosters(), { wrapper });
    await waitFor(() => expect(result1.current.isLoading).toBe(false));

    const { result: result2 } = renderHook(() => useRoosters(), { wrapper });
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    // Should only call fetch once due to caching
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result2.current.roosters).toEqual(mockRoosters);
  });
});

describe('useRooster', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch single rooster successfully', async () => {
    const mockRooster = {
      id: 'R001',
      breed: 'Kelso',
      status: 'Available',
      price: '5000',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockRooster }),
    });

    const { result } = renderHook(() => useRooster('R001'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rooster).toEqual(mockRooster);
  });

  it('should not fetch when id is null', async () => {
    const { result } = renderHook(() => useRooster(null), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.rooster).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
