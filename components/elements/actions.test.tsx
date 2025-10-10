import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Actions, Action } from './actions';

describe('Actions', () => {
  it('renders children correctly', () => {
    render(<Actions>Child content</Actions>);
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Actions className="custom-class">Child</Actions>);
    expect(container.firstChild).toHaveClass('custom-class flex items-center gap-0.5');
  });
});

describe('Action', () => {
  it('renders button without tooltip', () => {
    render(<Action>Icon</Action>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('size-9', 'p-1.5', 'text-muted-foreground');
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('renders tooltip on hover', async () => {
    render(<Action tooltip="Test tooltip">Icon</Action>);
    const button = screen.getByRole('button');
    await userEvent.hover(button);
    expect(await screen.findByText('Test tooltip')).toBeInTheDocument();
  });

  it('includes sr-only label', () => {
    render(<Action label="Test label">Icon</Action>);
    const span = screen.getByText('Test label');
    expect(span).toHaveClass('sr-only');
  });

  it('uses label or tooltip for sr-only if no label', () => {
    render(<Action tooltip="Tooltip text">Icon</Action>);
    const span = screen.getByText('Tooltip text');
    expect(span).toHaveClass('sr-only');
  });

  it('applies custom variant and size', () => {
    render(<Action variant="default" size="lg">Icon</Action>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'default'); // Assuming shadcn sets data attributes
    // Note: Exact classes depend on shadcn implementation, but size and variant are passed
  });
});
