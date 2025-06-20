import { render, screen } from '@testing-library/react';
import { Toast } from './toast';
import { describe, it, expect } from '@jest/globals';

describe('Toast', () => {
  it('renders the toast message', () => {
    render(<Toast open title="Test Title">Test Message</Toast>);
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });
}); 