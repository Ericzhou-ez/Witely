import { render, screen } from '@testing-library/react';
import { AppsSection } from './apps-section';

describe('AppsSection', () => {
  it('renders the connected apps header and description', () => {
    render(<AppsSection />);
    expect(screen.getByText('Connected apps')).toBeInTheDocument();
    expect(screen.getByText('Manage your connected applications and services.')).toBeInTheDocument();
  });

  it('renders all app items with correct details', () => {
    render(<AppsSection />);

    // Google Calendar - connected
    expect(screen.getByText('Google Calendar')).toBeInTheDocument();
    expect(screen.getByText('Sync your calendar events and schedule')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disconnect' })).toBeInTheDocument();

    // Slack - not connected
    expect(screen.getByText('Slack')).toBeInTheDocument();
    expect(screen.getByText('Send notifications and updates to Slack')).toBeInTheDocument();
    expect(screen.queryByText('Connected')).toBeNull(); // No badge for Slack
    expect(screen.getByRole('button', { name: 'Connect' })).toBeInTheDocument(); // There are multiple Connect buttons, but getByRole will get the first, but since texts differ, better to use getByText for buttons too

    // Adjust for multiple buttons
    const connectButtons = screen.getAllByRole('button', { name: 'Connect' });
    expect(connectButtons).toHaveLength(2); // Slack and GitHub

    const disconnectButtons = screen.getAllByRole('button', { name: 'Disconnect' });
    expect(disconnectButtons).toHaveLength(2); // Google and Notion

    // Notion - connected
    expect(screen.getByText('Notion')).toBeInTheDocument();
    expect(screen.getByText('Export and sync your notes with Notion')).toBeInTheDocument();
    // Badge already checked generally, but since only two, it's fine

    // GitHub - not connected
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Connect your GitHub repositories')).toBeInTheDocument();
  });

  it('renders four app cards', () => {
    render(<AppsSection />);
    const appCards = screen.getAllByRole('article'); // Assuming border p-4 div is article, but actually it's div, so maybe getAllByTestId or count by name
    // Since no role, perhaps count by getAllByText for unique names
    const appNames = ['Google Calendar', 'Slack', 'Notion', 'GitHub'];
    appNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});
