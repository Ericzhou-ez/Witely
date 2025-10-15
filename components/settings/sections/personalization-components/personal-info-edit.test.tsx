import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest'; // Assuming vitest is used
import PersonalInfoEdit from './personal-info-edit';

describe('PersonalInfoEdit', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnNameChange = vi.fn();
  const mockOnEmailChange = vi.fn();
  const mockOnPhoneChange = vi.fn();
  const mockOnAddressLine1Change = vi.fn();
  const mockOnAddressLine2Change = vi.fn();
  const mockOnCityChange = vi.fn();
  const mockOnStateChange = vi.fn();
  const mockOnZipCodeChange = vi.fn();
  const mockOnCountryChange = vi.fn();
  const mockOnGenderChange = vi.fn();

  const defaultProps = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4B',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    country: 'USA',
    gender: 'Male',
    onSave: mockOnSave,
    onCancel: mockOnCancel,
    onNameChange: mockOnNameChange,
    onEmailChange: mockOnEmailChange,
    onPhoneChange: mockOnPhoneChange,
    onAddressLine1Change: mockOnAddressLine1Change,
    onAddressLine2Change: mockOnAddressLine2Change,
    onCityChange: mockOnCityChange,
    onStateChange: mockOnStateChange,
    onZipCodeChange: mockOnZipCodeChange,
    onCountryChange: mockOnCountryChange,
    onGenderChange: mockOnGenderChange,
    isSaving: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the edit form with all fields', () => {
    render(<PersonalInfoEdit {...defaultProps} />);

    expect(screen.getByText('Edit Personal Information')).toBeInTheDocument();

    // Check input fields
    expect(screen.getByLabelText('Full Name (required)')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Address Line 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Address Line 2')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State or Province')).toBeInTheDocument();
    expect(screen.getByLabelText('ZIP or Postal Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Country or Region')).toBeInTheDocument();

    // Gender select
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('Male');

    // Buttons
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onChange handlers when inputs are changed', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoEdit {...defaultProps} />);

    const nameInput = screen.getByLabelText('Full Name (required)');
    await user.type(nameInput, ' Updated');
    expect(mockOnNameChange).toHaveBeenCalledWith('John Doe Updated');

    const emailInput = screen.getByLabelText('Email');
    await user.clear(emailInput);
    await user.type(emailInput, 'new@example.com');
    expect(mockOnEmailChange).toHaveBeenCalledWith('new@example.com');
  });

  it('calls onSave and onCancel when buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoEdit {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    await user.click(saveButton);
    expect(mockOnSave).toHaveBeenCalledTimes(1);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows saving text when isSaving is true', () => {
    render(<PersonalInfoEdit {...defaultProps} isSaving={true} />);

    const saveButton = screen.getByRole('button', { name: 'Saving...' });
    expect(saveButton).toBeDisabled();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeDisabled();
  });

  it('renders with empty values', () => {
    const emptyProps = {
      ...defaultProps,
      name: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      gender: '',
    };

    render(<PersonalInfoEdit {...emptyProps} />);

    expect(screen.getByLabelText('Full Name (required)')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveTextContent('Select your gender');
  });

  it('updates gender select value', async () => {
    const user = userEvent.setup();
    render(<PersonalInfoEdit {...defaultProps} />);

    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);

    const femaleOption = screen.getByRole('option', { name: 'Female' });
    await user.click(femaleOption);

    expect(mockOnGenderChange).toHaveBeenCalledWith('Female');
    expect(selectTrigger).toHaveTextContent('Female');
  });
});
