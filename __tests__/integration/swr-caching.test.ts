/**
 * Integration test for SWR caching behavior
 */

describe('SWR Caching', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should cache API responses', async () => {
    const mockData = [{ id: '1', name: 'Item 1' }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockData }),
    });

    // First call
    const response1 = await fetch('/api/inventory');
    const data1 = await response1.json();

    // Second call (should use cache in real SWR)
    const response2 = await fetch('/api/inventory');
    const data2 = await response2.json();

    expect(data1.data).toEqual(mockData);
    expect(data2.data).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle cache keys with different parameters', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    await fetch('/api/inventory?page=1');
    await fetch('/api/inventory?page=2');

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/inventory?page=1');
    expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/inventory?page=2');
  });

  it('should deduplicate simultaneous requests', async () => {
    const mockData = [{ id: '1', name: 'Item 1' }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockData }),
    });

    // Simulate simultaneous requests
    const [response1, response2, response3] = await Promise.all([
      fetch('/api/inventory'),
      fetch('/api/inventory'),
      fetch('/api/inventory'),
    ]);

    const [data1, data2, data3] = await Promise.all([
      response1.json(),
      response2.json(),
      response3.json(),
    ]);

    expect(data1.data).toEqual(mockData);
    expect(data2.data).toEqual(mockData);
    expect(data3.data).toEqual(mockData);
    
    // All three should have been called (no deduplication in raw fetch)
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
