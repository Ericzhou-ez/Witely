import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationsSection } from './notifications-section';
import { expect, describe, it, vi } from 'vitest'; // Assuming Vitest is used, adjust if Jest

describe('NotificationsSection', () => {
  it('renders without crashing', () => {
    render(<NotificationsSection />);
  });

  it('renders promotional switch initially checked', () => {
    render(<NotificationsSection />);
    const promotionalSwitch = screen.getByRole('switch', { name: /promotional/i });
    expect(promotionalSwitch).toBeInTheDocument();
    expect(promotionalSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles promotional switch on click', () => {
    render(<NotificationsSection />);
    const promotionalSwitch = screen.getByRole('switch', { name: /promotional/i });
    fireEvent.click(promotionalSwitch);
    expect(promotionalSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('renders witely tips switch initially checked', () => {
    render(<NotificationsSection />);
    const witelyTipsSwitch = screen.getByRole('switch', { name: /witely tips/i });
    expect(witelyTipsSwitch).toBeInTheDocument();
    expect(witelyTipsSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles witely tips switch on click', () => {
    render(<NotificationsSection />);
    const witelyTipsSwitch = screen.getByRole('switch', { name: /witely tips/i });
    fireEvent.click(witelyTipsSwitch);
    expect(witelyTipsSwitch).toHaveAttribute('aria-checked', 'false');
  });

  it('renders privacy policy link', () => {
    render(<NotificationsSection />);
    const link = screen.getByRole('link', { name: /here/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/privacy-policy');
  });

  it('displays correct descriptions', () => {
    render(<NotificationsSection />);
    expect(screen.getByText(/Receive emails about new features, updates, and special offers./)).toBeInTheDocument();
    expect(screen.getByText(/Get personalized suggestions, schedule summaries, weather updates, and things you need to do for the day./)).toBeInTheDocument();
  });
});
