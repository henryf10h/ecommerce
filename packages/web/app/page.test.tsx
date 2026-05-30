import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';

// Mock OnchainStore since it depends on OnchainKit/wagmi context
vi.mock('../components/OnchainStore', () => {
  return {
    default: () => <div data-testid="onchain-store">Store</div>,
  };
});

describe('Web home page', () => {
  it('renders the store with version from core', () => {
    render(<Page />);
    expect(screen.getByTestId('onchain-store')).toBeDefined();
    expect(screen.getByText(/v\d+\.\d+\.\d+/)).toBeDefined();
  });
});
