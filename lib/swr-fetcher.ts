// Generic fetcher for SWR
export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object
    const errorData = await response.json().catch(() => ({}));
    (error as Error & { info?: unknown; status?: number }).info = errorData;
    (error as Error & { info?: unknown; status?: number }).status = response.status;
    throw error;
  }

  const json = await response.json();

  // Handle API response format { success: boolean, data: T }
  if (json.success === false) {
    const error = new Error(json.message || "API request failed");
    (error as Error & { info?: unknown }).info = json;
    throw error;
  }

  return json.data || json;
}

// Fetcher with query params
export async function fetcherWithParams<T>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  const fullUrl = searchParams.toString()
    ? `${url}?${searchParams.toString()}`
    : url;

  return fetcher<T>(fullUrl);
}
