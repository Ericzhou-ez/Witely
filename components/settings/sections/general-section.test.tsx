import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTheme } from 'next-themes';
import { GeneralSection } from './general-section';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe('GeneralSection', () => {
  const mockSetTheme = jest.fn();
  const defaultTheme = 'system';

  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      theme: defaultTheme,
      setTheme: mockSetTheme,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with all selects', () => {
    render(<GeneralSection />);

    expect(screen.getByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Accent color')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('For best results, select your primary language.')).toBeInTheDocument();
  });

  it('renders theme select with correct options and current value', () => {
    render(<GeneralSection />);

    const themeSelect = screen.getByRole('combobox', { name: /theme/i });
    expect(themeSelect).toBeInTheDocument();

    // Simulate opening the select to check options
    fireEvent.click(themeSelect);

    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Paper')).toBeInTheDocument();

    // The value should be the current theme
    expect(themeSelect).toHaveValue(defaultTheme);
  });

  it('calls setTheme when theme is changed', () => {
    render(<GeneralSection />);

    const themeSelect = screen.getByRole('combobox', { name: /theme/i });
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('renders accent color select with default value and options', () => {
    render(<GeneralSection />);

    const accentSelect = screen.getByRole('combobox', { name: /accent color/i });
    expect(accentSelect).toBeInTheDocument();
    expect(accentSelect).toHaveValue('monochrome');

    // Check options
    fireEvent.click(accentSelect);
    expect(screen.getByText('Monochrome')).toBeInTheDocument();
    expect(screen.getByText('Orange')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
    expect(screen.getByText('Purple')).toBeInTheDocument();
    expect(screen.getByText('Pink')).toBeInTheDocument();

    // Check color indicators are rendered
    const colorDivs = screen.getAllByRole('option').map(option => option.querySelector('div'));
    expect(colorDivs[0]).toHaveStyle('background-color: rgb(128, 128, 128);'); // monochrome gray
  });

  it('renders language select with default value and options', () => {
    render(<GeneralSection />);

    const languageSelect = screen.getByRole('combobox', { name: /language/i });
    expect(languageSelect).toBeInTheDocument();
    expect(languageSelect).toHaveValue('auto');

    // Check options
    fireEvent.click(languageSelect);
    expect(screen.getByText('Auto-detect')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();
    expect(screen.getByText('German')).toBeInTheDocument();
    expect(screen.getByText('Japanese')).toBeInTheDocument();
    expect(screen.getByText('Chinese')).toBeInTheDocument();
  });

  it('updates theme display when current theme changes', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    render(<GeneralSection />);

    const themeSelect = screen.getByRole('combobox', { name: /theme/i });
    expect(themeSelect).toHaveValue('dark');
  });
});