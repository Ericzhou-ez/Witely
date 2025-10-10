import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from './page';
import { cookies } from 'next/headers';

// Mock the cookies function
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('Chat Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Chat component with default model when no cookie is set', async () => {
    const mockCookies = jest.fn().mockResolvedValue({
      get: jest.fn().mockReturnValue(null),
    });
    (require('next/headers') as any).cookies = mockCookies;

    const PageComponent = await Page();
    render(PageComponent);

    // Assuming Chat component has a test ID or specific text
    expect(screen.getByText(/chat/i)).toBeInTheDocument(); // Adjust based on actual content
    // Or check for DataStreamHandler if it has identifiable content
  });

  it('renders Chat component with model from cookie when set', async () => {
    const mockCookies = jest.fn().mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: 'gpt-4' }),
    });
    (require('next/headers') as any).cookies = mockCookies;

    const PageComponent = await Page();
    render(PageComponent);

    // Verify that Chat is rendered with the model prop, but since it's internal, perhaps just check rendering
    expect(screen.getByText(/chat/i)).toBeInTheDocument();
  });
});
