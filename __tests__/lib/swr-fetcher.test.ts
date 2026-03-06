import { fetcher, fetcherWithParams } from '@/lib/swr-fetcher';

global.fetch = jest.fn();

describe('SWR Fetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetcher', () => {
    it('should fetch and return data successfully', async () => {
      const mockData = { id: '1', name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      const result = await fetcher('/api/test');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test');
    });

    it('should handle API error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ success: false, message: 'Not found' }),
      });

      await expect(fetcher('/api/test')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(fetcher('/api/test')).rejects.toThrow('Network error');
    });

    it('should handle responses without success field', async () => {
      const mockData = { id: '1', name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetcher('/api/test');

      expect(result).toEqual(mockData);
    });
  });

  describe('fetcherWithParams', () => {
    it('should fetch with query parameters', async () => {
      const mockData = { items: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      const params = { locationId: 'LOC001', limit: 10 };
      const result = await fetcherWithParams('/api/inventory', params);

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/inventory?locationId=LOC001&limit=10'
      );
    });

    it('should skip undefined parameters', async () => {
      const mockData = { items: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      const params = { locationId: 'LOC001', limit: undefined };
      await fetcherWithParams('/api/inventory', params);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/inventory?locationId=LOC001'
      );
    });

    it('should work without parameters', async () => {
      const mockData = { items: [] };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      await fetcherWithParams('/api/inventory');

      expect(global.fetch).toHaveBeenCalledWith('/api/inventory');
    });
  });
});
