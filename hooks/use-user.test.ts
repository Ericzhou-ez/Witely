import { renderHook, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useUser } from './use-user';

// Mock useSession
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch for SWR
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
})) as jest.Mock;

describe('useUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it('returns loading state when session is loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isError).toBeNull();
  });

  it('does not fetch and returns null user when unauthenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isError).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('fetches user data when authenticated and returns user', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    };

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated',
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });

    const { result, waitFor } = renderHook(() => useUser());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isError).toBeNull();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/user');
  });

  it('handles fetch error and sets isError', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated',
    });

    const error = new Error('Failed to fetch');
    (global.fetch as jest.Mock).mockRejectedValue(error);

    const { result, waitFor } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.isError).toBeDefined();
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/user');
  });

  it('mutates user data successfully', async () => {
    const initialUser = { id: 1, email: 'old@example.com', name: 'Old User' };
    const updatedUser = { id: 1, email: 'new@example.com', name: 'New User' };

    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      status: 'authenticated',
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => initialUser,
    });

    const { result, waitFor } = renderHook(() => useUser());

    await waitFor(() => expect(result.current.user).toEqual(initialUser));

    await act(async () => {
      await result.current.mutate(updatedUser);
    });

    expect(result.current.user).toEqual(updatedUser);
  });
});
