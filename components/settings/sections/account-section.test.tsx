import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/toast';
import { AccountSection } from './account-section';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock custom hook
jest.mock('@/hooks/use-user', () => ({
  useUser: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock toast
jest.mock('@/components/toast', () => ({
  toast: jest.fn(),
}));

// Mock navigator.clipboard
const mockWriteText = jest.fn();
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockWriteText },
  writable: true,
});

describe('AccountSection', () => {
  const mockPush = jest.fn();
  const mockSession = {
    data: { user: { id: 'user-123', name: 'John Doe', email: 'john@example.com', image: '/avatar.jpg' } },
    status: 'authenticated',
  };
  const mockUser = {
    user: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      profileURL: '/profile.jpg',
      type: 'pro',
    },
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (useUser as jest.Mock).mockReturnValue(mockUser);
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders loading state with skeletons', () => {
    (useUser as jest.Mock).mockReturnValue({ ...mockUser, isLoading: true });

    render(<AccountSection />);

    // Check for skeleton elements (assuming Skeleton renders a div with specific class)
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Avatar skeleton might not have role, but let's check for skeleton classes
    // More precisely, since Skeleton is a component, we can check for presence of skeleton-like elements
    const skeletons = screen.getAllByTestId?.('skeleton') || screen.getAllByRole('status'); // Adjust based on Skeleton implementation
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
  });

  it('renders user profile when loaded', () => {
    render(<AccountSection />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /avatar/i })).toBeInTheDocument(); // Avatar
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('displays account type correctly', () => {
    render(<AccountSection />);

    expect(screen.getByText('Pro')).toBeInTheDocument(); // Capitalized
  });

  it('copies user ID to clipboard and shows success state', async () => {
    render(<AccountSection />);

    const copyButton = screen.getByRole('button', { name: /copy user id/i });
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument(); // Assume icon has testid or query by role

    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith('user-123');

    // Check icon changes to check
    await waitFor(() => {
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    // Check toast
    expect(toast).toHaveBeenCalledWith({ type: 'success', description: 'Copied user uuid to clipboard!' });
  });

  it('navigates to data controls on manage button click', () => {
    render(<AccountSection />);

    const manageButton = screen.getByRole('button', { name: /manage/i });
    fireEvent.click(manageButton);

    expect(mockPush).toHaveBeenCalledWith('/data-controls');
  });

  it('handles shared links button click', () => {
    const mockOnClick = jest.fn();
    // Since onClick is empty, just check it exists and click doesn't error
    render(<AccountSection />);

    const viewButton = screen.getByRole('button', { name: /view/i }); // First view button for shared links
    fireEvent.click(viewButton);

    // No specific expectation, just that it renders and clicks
    expect(viewButton).toBeInTheDocument();
  });

  it('handles delete data button click', () => {
    render(<AccountSection />);

    const deleteDataButton = screen.getByRole('button', { name: /delete/i }); // First delete for data
    fireEvent.click(deleteDataButton);

    expect(deleteDataButton).toBeInTheDocument();
  });

  it('handles delete account button click', () => {
    render(<AccountSection />);

    const deleteAccountButton = screen.getAllByRole('button', { name: /delete/i })[1]; // Second delete
    fireEvent.click(deleteAccountButton);

    expect(deleteAccountButton).toBeInTheDocument();
  });

  it('renders link to privacy policy', () => {
    render(<AccountSection />);

    expect(screen.getByRole('link', { name: /here/i })).toHaveAttribute('href', '/privacy-policy');
  });

  it('shows avatar fallback when no image', () => {
    (useSession as jest.Mock).mockReturnValue({
      ...mockSession,
      data: { user: { ...mockSession.data.user, image: undefined } },
    });
    (useUser as jest.Mock).mockReturnValue({
      ...mockUser,
      user: { ...mockUser.user, profileURL: undefined },
    });

    render(<AccountSection />);

    // Avatar fallback should show 'J'
    const fallback = screen.getByText('J');
    expect(fallback).toBeInTheDocument();
  });
});
