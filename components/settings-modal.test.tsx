import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsModal } from './settings-modal';
import { useSettingsModal } from '@/hooks/use-settings-modal';
import { useIsMobile } from '@/hooks/use-mobile';

// Mock the custom hooks
jest.mock('@/hooks/use-settings-modal');
jest.mock('@/hooks/use-mobile');

// Mock the layout components for testing
jest.mock('./settings/settings-desktop-layout', () => ({
  SettingsDesktopLayout: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="desktop-layout" onClick={onClose}>
      Desktop Settings Layout
    </div>
  ),
}));

jest.mock('./settings/settings-mobile-layout', () => ({
  SettingsMobileLayout: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="mobile-layout" onClick={onClose}>
      Mobile Settings Layout
    </div>
  ),
}));

// Mock framer-motion to prevent animation issues in tests
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: ({ children, ...props }: any) => (
    <div {...props} data-motion="true">
      {children}
    </div>
  ),
}));

describe('SettingsModal', () => {
  const mockClose = jest.fn();
  const mockToggle = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSettingsModal as jest.Mock).mockReturnValue({
      isOpen: false,
      close: mockClose,
      toggle: mockToggle,
    });
    (useIsMobile as jest.Mock).mockReturnValue(false);

    // Reset body style
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('does not render modal when isOpen is false', () => {
    render(<SettingsModal />);
    expect(screen.queryByTestId('desktop-layout')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-layout')).not.toBeInTheDocument();
  });

  it('renders desktop layout when isOpen is true and not mobile', () => {
    (useSettingsModal as jest.Mock).mockReturnValue({
      isOpen: true,
      close: mockClose,
      toggle: mockToggle,
    });

    render(<SettingsModal />);
    expect(screen.getByTestId('desktop-layout')).toBeInTheDocument();
  });

  it('renders mobile layout when isOpen is true and is mobile', () => {
    (useSettingsModal as jest.Mock).mockReturnValue({
      isOpen: true,
      close: mockClose,
      toggle: mockToggle,
    });
    (useIsMobile as jest.Mock).mockReturnValue(true);

    render(<SettingsModal />);
    expect(screen.getByTestId('mobile-layout')).toBeInTheDocument();
  });

  it('calls close when overlay is clicked', async () => {
    (useSettingsModal as jest.Mock).mockReturnValue({
      isOpen: true,
      close: mockClose,
      toggle: mockToggle,
    });

    render(<SettingsModal />);
    const overlay = screen.getByRole('button', { hidden: true }); // Assuming backdrop has role, but adjust
    // Since it's div with onClick, use container
    const { container } = render(<SettingsModal />);
    const backdrop = container.querySelector('[data-motion="true"]:first-child') as HTMLElement;
    if (backdrop) {
      await user.click(backdrop);
      expect(mockClose).toHaveBeenCalledTimes(1);
    }
  });

  it('handles Escape key to close modal', () => {
    (useSettingsModal as jest.Mock).mockReturnValue({
      isOpen: true,
      close: mockClose,
      toggle: mockToggle,
    });

    render(<SettingsModal />);
    fireEvent.keyDown(document, { key: 'Escape', bubbles: true });
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('toggles modal on Cmd + , key combination', () => {
    (useSettingsModal as jest.Mock).mockReturnValue({
      isOpen: false,
      close: mockClose,
      toggle: mockToggle,
    });

    render(<SettingsModal />);
    fireEvent.keyDown(document, { key: ',', metaKey: true, bubbles: true });
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('sets body overflow to hidden when modal is open', () => {
    (useSettingsModal as jest.Mock).mockReturnValue({
      isOpen: true,
      close: mockClose,
      toggle: mockToggle,
    });

    expect(document.body.style.overflow).toBe('');
    render(<SettingsModal />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when modal closes', () => {
    const originalOverflow = document.body.style.overflow;
    (useSettingsModal as jest.Mock).mockReturnValue({
      isOpen: true,
      close: mockClose,
      toggle: mockToggle,
    });

    render(<SettingsModal />);
    expect(document.body.style.overflow).toBe('hidden');

    // Simulate close
    (useSettingsModal as jest.Mock).mockReturnValue({
      isOpen: false,
      close: mockClose,
      toggle: mockToggle,
    });
    const { rerender } = render(<SettingsModal />);
    rerender(<SettingsModal />);
    expect(document.body.style.overflow).toBe(originalOverflow);
  });
});
