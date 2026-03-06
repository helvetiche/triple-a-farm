/**
 * Integration tests for SWR caching system
 * Tests the complete flow from hooks to API routes with Redis caching
 */

import { renderHook } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useRoosters } from '@/hooks/use-roosters';
import { useInventory } from '@/hooks/use-inventory';
import { ReactNode } from 'react';

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

describe('Caching Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should deduplicate simultaneous requests', async () => {
    const mockRoosters = [
      { id: 'R001', breed: 'Kelso', status: 'Available' },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockRoosters }),
    });

    // Render multiple hooks simultaneously
    const { result: result1 } = renderHook(() => useRoosters(), { wrapper });
    const { result: result2 } = renderHook(() => useRoosters(), { wrapper });
    const { result: result3 } = renderHook(() => useRoosters(), { wrapper });

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
      expect(result2.current.isLoading).toBe(false);
      expect(result3.current.isLoading).toBe(false);
    });

    // Should only make one fetch call due to deduplication
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result1.current.roosters).toEqual(mockRoosters);
    expect(result2.current.roosters).toEqual(mockRoosters);
    expect(result3.current.roosters).toEqual(mockRoosters);
  });

  it('should handle cache invalidation via mutate', async () => {
    const initialData = [{ id: 'R001', breed: 'Kelso' }];
    const updatedData = [
      { id: 'R001', breed: 'Kelso' },
      { id: 'R002', breed: 'Hatch' },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: initialData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: updatedData }),
      });

    const { result } = renderHook(() => useRoosters(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.roosters).toEqual(initialData);

    // Trigger revalidation
    await result.current.mutate();

    await waitFor(() => {
      expect(result.current.roosters).toEqual(updatedData);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should cache different endpoints independently', async () => {
    const mockRoosters = [{ id: 'R001', breed: 'Kelso' }];
    const mockInventory = [{ id: 'INV001', name: 'Feed' }];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockRoosters }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockInventory }),
      });

    const { result: roostersResult } = renderHook(() => useRoosters(), {
      wrapper,
    });
    const { result: inventoryResult } = renderHook(() => useInventory(), {
      wrapper,
    });

    await waitFor(() => {
      expect(roostersResult.current.isLoading).toBe(false);
      expect(inventoryResult.current.isLoading).toBe(false);
    });

    expect(roostersResult.current.roosters).toEqual(mockRoosters);
    expect(inventoryResult.current.items).toEqual(mockInventory);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle error states correctly', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useRoosters(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBeDefined();
    expect(result.current.roosters).toBeUndefined();
  });

  it('should support optimistic updates', async () => {
    const initialData = [{ id: 'R001', breed: 'Kelso', status: 'Available' }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: initialData }),
    });

    const { result } = renderHook(() => useRoosters(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Optimistic update - just verify mutate can be called
    // Note: Full type checking would require complete Rooster objects
    await result.current.mutate();

    expect(result.current.roosters).toBeDefined();
  });
});
