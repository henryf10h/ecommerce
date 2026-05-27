import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from './page';

describe('Web home page', () => {
  it('renders the placeholder heading', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /commerce-x402 web/i })).toBeDefined();
  });
});
