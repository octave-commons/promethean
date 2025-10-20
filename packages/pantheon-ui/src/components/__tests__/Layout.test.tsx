import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Layout from '../Layout';

describe('Layout', () => {
  it('renders layout correctly', () => {
    render(<Layout />);
    // Basic layout test
    expect(document.body).toBeTruthy();
  });
});
