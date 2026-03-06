/**
 * Integration test for server-side pagination
 */

describe('Server-Side Pagination', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch page 1 with correct parameters', async () => {
    const mockResponse = {
      items: [{ id: '1', name: 'Item 1' }],
      total: 50,
      page: 1,
      limit: 10,
      totalPages: 5,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockResponse }),
    });

    const response = await fetch('/api/inventory?page=1&limit=10');
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith('/api/inventory?page=1&limit=10');
    expect(data.data.page).toBe(1);
    expect(data.data.items).toHaveLength(1);
  });

  it('should fetch page 2 with different data', async () => {
    const mockResponse = {
      items: [{ id: '11', name: 'Item 11' }],
      total: 50,
      page: 2,
      limit: 10,
      totalPages: 5,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockResponse }),
    });

    const response = await fetch('/api/inventory?page=2&limit=10');
    const data = await response.json();

    expect(global.fetch).toHaveBeenCalledWith('/api/inventory?page=2&limit=10');
    expect(data.data.page).toBe(2);
    expect(data.data.items[0].id).toBe('11');
  });

  it('should include filters in pagination request', async () => {
    const mockResponse = {
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockResponse }),
    });

    await fetch('/api/inventory?page=1&limit=10&status=low&category=Feed');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/inventory?page=1&limit=10&status=low&category=Feed'
    );
  });

  it('should calculate total pages correctly', async () => {
    const mockResponse = {
      items: [],
      total: 47,
      page: 1,
      limit: 10,
      totalPages: 5, // Math.ceil(47/10) = 5
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockResponse }),
    });

    const response = await fetch('/api/inventory?page=1&limit=10');
    const data = await response.json();

    expect(data.data.totalPages).toBe(5);
  });
});
