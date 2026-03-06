import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';

// Custom render function with SWR provider
export function renderWithSWR(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Helper to wait for async updates
export function waitForNextUpdate(timeout = 1000): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export * from '@testing-library/react';
