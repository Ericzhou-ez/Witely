import { render, screen, fireEvent } from '@testing-library/react';
import PersonalInfoDisplay, { GENDER_OPTIONS } from './personal-info-display';

describe('PersonalInfoDisplay', () => {
  const mockOnEdit = jest.fn();

  const defaultProps = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    gender: 'Male',
    onEdit: mockOnEdit,
  };

  beforeEach(() => {
    mockOnEdit.mockClear();
  });

  it('renders personal information correctly', () => {
    render(<PersonalInfoDisplay {...defaultProps} />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();

    const addressElement = screen.getByText('123 Main St, Apt 4, New York, NY, 10001, USA');
    expect(addressElement).toBeInTheDocument();
  });

  it('shows "Not provided" for missing name', () => {
    const props = { ...defaultProps, name: '' };
    render(<PersonalInfoDisplay {...props} />);

    expect(screen.getByText('Not provided')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('shows "Not provided" for missing email', () => {
    const props = { ...defaultProps, email: '' };
    render(<PersonalInfoDisplay {...props} />);

    expect(screen.getByText('Not provided')).toBeInTheDocument();
    expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
  });

  it('shows "Not provided" for missing phone', () => {
    const props = { ...defaultProps, phone: '' };
    render(<PersonalInfoDisplay {...props} />);

    expect(screen.getByText('Not provided')).toBeInTheDocument();
    expect(screen.queryByText('123-456-7890')).not.toBeInTheDocument();
  });

  it('formats address correctly with partial information', () => {
    const partialProps = {
      ...defaultProps,
      addressLine1: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      addressLine2: '',
      zipCode: '',
    };

    render(<PersonalInfoDisplay {...partialProps} />);

    expect(screen.getByText('123 Main St, New York, NY, USA')).toBeInTheDocument();
  });

  it('displays "Not provided" for empty address', () => {
    const noAddressProps = {
      ...defaultProps,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    };

    render(<PersonalInfoDisplay {...noAddressProps} />);

    expect(screen.getByText('Not provided')).toBeInTheDocument(); // for address
  });

  it('displays gender label correctly', () => {
    render(<PersonalInfoDisplay {...defaultProps} />);

    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('displays "Not provided" for unknown gender', () => {
    const props = { ...defaultProps, gender: 'Unknown' };
    render(<PersonalInfoDisplay {...props} />);

    expect(screen.getByText('Not provided')).toBeInTheDocument();
  });

  it('displays "Not provided" for empty gender', () => {
    const props = { ...defaultProps, gender: '' };
    render(<PersonalInfoDisplay {...props} />);

    expect(screen.getByText('Not provided')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<PersonalInfoDisplay {...defaultProps} />);

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });
});
