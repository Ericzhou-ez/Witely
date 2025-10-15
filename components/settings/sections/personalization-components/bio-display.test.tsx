import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BioDisplay from './bio-display';

describe('BioDisplay', () => {
  const mockOnEdit = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the bio section title', () => {
    render(<BioDisplay bio="" onEdit={mockOnEdit} />);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Bio');
  });

  it('renders bio text when provided', () => {
    const bio = 'Test bio content';
    render(<BioDisplay bio={bio} onEdit={mockOnEdit} />);
    expect(screen.getByText(bio)).toBeInTheDocument();
  });

  it('renders placeholder text when bio is empty', () => {
    render(<BioDisplay bio="" onEdit={mockOnEdit} />);
    expect(screen.getByText('Tell Witely about yourself')).toBeInTheDocument();
  });

  it('calls onEdit when the edit button is clicked', () => {
    render(<BioDisplay bio="test" onEdit={mockOnEdit} />);
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('renders the edit button', () => {
    render(<BioDisplay bio="test" onEdit={mockOnEdit} />);
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
});
