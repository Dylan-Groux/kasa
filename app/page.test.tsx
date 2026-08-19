import { render, screen } from '@testing-library/react';
import Home from './page';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Home page', () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  beforeEach(() => {
    delete process.env.BACKEND_API_URL;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.BACKEND_API_URL = originalBackendUrl;
    vi.restoreAllMocks();
  });

  it('renders the Kasa home page', async () => {
    render(await Home());
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
