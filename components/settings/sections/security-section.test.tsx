import { render, screen, fireEvent } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import { SecuritySection } from './security-section';

// Mock signOut
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}));

const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;

describe('SecuritySection', () => {
  beforeEach(() => {
    mockedSignOut.mockClear();
  });

  it('renders change password section', () => {
    render(<SecuritySection />);
    expect(screen.getByText('Change password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument();
  });

  it('renders active sessions section', () => {
    render(<SecuritySection />);
    expect(screen.getByText('Active sessions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
  });

  it('renders logout section', () => {
    render(<SecuritySection />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  it('calls signOut when logout button is clicked', () => {
    render(<SecuritySection />);
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(logoutButton);
    expect(mockedSignOut).toHaveBeenCalledWith({ redirectTo: '/login' });
  });
});
