import {
  getCached,
  setCached,
  deleteCached,
  withCache,
  CACHE_KEYS,
  CACHE_TTL,
} from '@/lib/redis';

// Mock @upstash/redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  })),
}));

describe('Redis Cache Functions', () => {
  let mockRedis: {
    get: jest.Mock;
    setex: jest.Mock;
    del: jest.Mock;
    keys: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require('@upstash/redis');
    mockRedis = new Redis();
  });

  describe('getCached', () => {
    it('should retrieve cached data', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockRedis.get.mockResolvedValueOnce(mockData);

      const result = await getCached('test-key');

      expect(result).toEqual(mockData);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null on error', async () => {
      mockRedis.get.mockRejectedValueOnce(new Error('Redis error'));

      const result = await getCached('test-key');

      expect(result).toBeNull();
    });
  });

  describe('setCached', () => {
    it('should set cached data with TTL', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockRedis.setex.mockResolvedValueOnce('OK');

      await setCached('test-key', mockData, 60);

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test-key',
        60,
        JSON.stringify(mockData)
      );
    });

    it('should handle errors gracefully', async () => {
      mockRedis.setex.mockRejectedValueOnce(new Error('Redis error'));

      await expect(setCached('test-key', {}, 60)).resolves.not.toThrow();
    });
  });

  describe('deleteCached', () => {
    it('should delete cached data', async () => {
      mockRedis.del.mockResolvedValueOnce(1);

      await deleteCached('test-key');

      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('withCache', () => {
    it('should return cached data if available', async () => {
      const mockData = { id: '1', name: 'Cached' };
      mockRedis.get.mockResolvedValueOnce(mockData);

      const fetcher = jest.fn();
      const result = await withCache('test-key', 60, fetcher);

      expect(result).toEqual(mockData);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should fetch and cache data if not in cache', async () => {
      const mockData = { id: '1', name: 'Fresh' };
      mockRedis.get.mockResolvedValueOnce(null);
      mockRedis.setex.mockResolvedValueOnce('OK');

      const fetcher = jest.fn().mockResolvedValueOnce(mockData);
      const result = await withCache('test-key', 60, fetcher);

      expect(result).toEqual(mockData);
      expect(fetcher).toHaveBeenCalled();
    });
  });

  describe('CACHE_KEYS', () => {
    it('should generate correct cache keys', () => {
      expect(CACHE_KEYS.ROOSTERS).toBe('roosters:all');
      expect(CACHE_KEYS.ROOSTER('R001')).toBe('rooster:R001');
      expect(CACHE_KEYS.INVENTORY()).toBe('inventory:all');
      expect(CACHE_KEYS.INVENTORY('LOC001')).toBe('inventory:location:LOC001');
    });
  });

  describe('CACHE_TTL', () => {
    it('should have correct TTL values', () => {
      expect(CACHE_TTL.FAST).toBe(30);
      expect(CACHE_TTL.MEDIUM).toBe(60);
      expect(CACHE_TTL.SLOW).toBe(300);
      expect(CACHE_TTL.STATIC).toBe(600);
    });
  });
});
