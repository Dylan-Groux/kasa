import { render, screen } from '@testing-library/react';
import Home from './page';
import { describe, expect, it } from 'vitest';

describe('Home page', () => {
  it('renders the Kasa home page', () => {
    render(<Home />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
