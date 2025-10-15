import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BioEdit from './bio-edit';

describe('BioEdit', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnBioChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the bio label', () => {
    render(<BioEdit bio="" onSave={mockOnSave} onCancel={mockOnCancel} onBioChange={mockOnBioChange} />);
    expect(screen.getByText('Bio')).toBeInTheDocument();
  });

  it('renders textarea with correct value and placeholder', () => {
    const bio = 'Test bio';
    render(<BioEdit bio={bio} onSave={mockOnSave} onCancel={mockOnCancel} onBioChange={mockOnBioChange} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(bio);
    expect(textarea).toHaveAttribute('placeholder', 'Tell us about yourself');
  });

  it('calls onBioChange when typing in textarea', () => {
    render(<BioEdit bio="" onSave={mockOnSave} onCancel={mockOnCancel} onBioChange={mockOnBioChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new bio' } });
    expect(mockOnBioChange).toHaveBeenCalledWith('new bio');
  });

  it('renders save and cancel buttons', () => {
    render(<BioEdit bio="" onSave={mockOnSave} onCancel={mockOnCancel} onBioChange={mockOnBioChange} />);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', () => {
    render(<BioEdit bio="" onSave={mockOnSave} onCancel={mockOnCancel} onBioChange={mockOnBioChange} />);
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<BioEdit bio="" onSave={mockOnSave} onCancel={mockOnCancel} onBioChange={mockOnBioChange} />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows saving text when isSaving is true', () => {
    render(<BioEdit bio="" onSave={mockOnSave} onCancel={mockOnCancel} onBioChange={mockOnBioChange} isSaving={true} />);
    const saveButton = screen.getByRole('button', { name: /saving.../i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(saveButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('textarea has maxLength 500 and rows 4', () => {
    render(<BioEdit bio="" onSave={mockOnSave} onCancel={mockOnCancel} onBioChange={mockOnBioChange} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('maxLength', '500');
    expect(textarea).toHaveAttribute('rows', '4');
  });

  it('renders description text', () => {
    render(<BioEdit bio="" onSave={mockOnSave} onCancel={mockOnCancel} onBioChange={mockOnBioChange} />);
    expect(screen.getByText('A brief description about yourself (max 500 characters).')).toBeInTheDocument();
  });
});
