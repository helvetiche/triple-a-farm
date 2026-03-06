import { renderHook } from '@testing-library/react';
import { SWRConfig } from 'swr';
import {
  useInventory,
  useInventoryStats,
  useInventoryItem,
} from '@/hooks/use-inventory';
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

describe('useInventory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch inventory items successfully', async () => {
    const mockItems = [
      {
        id: 'INV001',
        name: 'Feed',
        category: 'Feed',
        currentStock: 100,
        minStock: 20,
      },
      {
        id: 'INV002',
        name: 'Medicine',
        category: 'Medical',
        currentStock: 50,
        minStock: 10,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockItems }),
    });

    const { result } = renderHook(() => useInventory(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual(mockItems);
    expect(global.fetch).toHaveBeenCalledWith('/api/inventory');
  });

  it('should fetch inventory with location filter', async () => {
    const mockItems = [
      {
        id: 'INV001',
        name: 'Feed',
        locationId: 'LOC001',
        currentStock: 100,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockItems }),
    });

    const { result } = renderHook(() => useInventory('LOC001'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.items).toEqual(mockItems);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/inventory?locationId=LOC001'
    );
  });
});

describe('useInventoryStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch inventory stats successfully', async () => {
    const mockStats = {
      totalItems: 50,
      lowStockItems: 5,
      outOfStockItems: 2,
      totalValue: 150000,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockStats }),
    });

    const { result } = renderHook(() => useInventoryStats(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toEqual(mockStats);
  });
});

describe('useInventoryItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch single inventory item', async () => {
    const mockItem = {
      id: 'INV001',
      name: 'Feed',
      currentStock: 100,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockItem }),
    });

    const { result } = renderHook(() => useInventoryItem('INV001'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.item).toEqual(mockItem);
  });

  it('should not fetch when id is null', async () => {
    const { result } = renderHook(() => useInventoryItem(null), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.item).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
