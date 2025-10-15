import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserMenu } from './user-menu';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSettingsModal } from '@/hooks/use-settings-modal';
import { toast } from './toast';

// Mock the modules
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-settings-modal', () => ({
  useSettingsModal: jest.fn(),
}));

jest.mock('./toast', () => ({
  toast: jest.fn(),
}));

// Mock window.open
global.open = jest.fn();

describe('UserMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'authenticated' });
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    const mockOpenSettings = jest.fn();
    (useSettingsModal as jest.Mock).mockReturnValue({ open: mockOpenSettings });
  });

  it('renders all menu items correctly', () => {
    render(<UserMenu />);

    expect(screen.getByText('Upgrade plan')).toBeInTheDocument();
    expect(screen.getByText('Get witely')).toBeInTheDocument();
    expect(screen.getByText('Help Center')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('navigates to upgrade plan on click', () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(<UserMenu />);
    fireEvent.click(screen.getByText('Upgrade plan'));

    expect(push).toHaveBeenCalledWith('/upgrade');
  });

  it('opens external link for Get witely on click', () => {
    render(<UserMenu />);
    fireEvent.click(screen.getByText('Get witely'));

    expect(global.open).toHaveBeenCalledWith('https://witely.ai', '_blank');
  });

  it('opens external link for Help Center on click', () => {
    render(<UserMenu />);
    fireEvent.click(screen.getByText('Help Center'));

    expect(global.open).toHaveBeenCalledWith('https://help.witely.ai', '_blank');
  });

  it('opens settings modal on click', () => {
    const openSettings = jest.fn();
    (useSettingsModal as jest.Mock).mockReturnValue({ open: openSettings });

    render(<UserMenu />);
    fireEvent.click(screen.getByText('Settings'));

    expect(openSettings).toHaveBeenCalled();
  });

  it('signs out on logout click when authenticated', () => {
    const mockSignOut = jest.fn().mockResolvedValue(undefined);
    (signOut as jest.Mock).mockImplementation(mockSignOut);

    render(<UserMenu />);
    fireEvent.click(screen.getByTestId('user-nav-item-auth'));

    expect(mockSignOut).toHaveBeenCalledWith({ redirectTo: '/' });
  });

  it('shows toast error and does not sign out when status is loading', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'loading' });
    const mockToast = jest.fn();
    (toast as jest.Mock).mockImplementation(mockToast);

    render(<UserMenu />);
    fireEvent.click(screen.getByTestId('user-nav-item-auth'));

    expect(mockToast).toHaveBeenCalledWith({
      type: 'error',
      description: 'Checking authentication status, please try again!',
    });
    expect(signOut).not.toHaveBeenCalled();
  });
});
