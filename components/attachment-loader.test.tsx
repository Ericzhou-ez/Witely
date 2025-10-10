import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AttachmentLoader } from './attachment-loader';

describe('AttachmentLoader', () => {
  it('renders nothing when attachments array is empty', () => {
    render(<AttachmentLoader attachments={[]} />);
    expect(screen.queryByText(/Reading/)).not.toBeInTheDocument();
  });

  it('renders loading bar for single attachment with name', () => {
    const attachments = [{ name: 'test.txt' }];
    render(<AttachmentLoader attachments={attachments} />);

    expect(screen.getByText('Reading test.txt')).toBeInTheDocument();

    // Check for icon
    const image = screen.getByAltText('File icon');
    expect(image).toBeInTheDocument();

    // Check for loading dots (three small circles)
    const dots = screen.getAllByRole('generic').filter(el => 
      el.className.includes('size-1') && el.className.includes('rounded-full')
    );
    expect(dots).toHaveLength(3);
  });

  it('renders loading bar for single attachment without name', () => {
    const attachments = [{}];
    render(<AttachmentLoader attachments={attachments} />);

    expect(screen.getByText('Reading attachment')).toBeInTheDocument();
  });

  it('renders loading bar for multiple attachments', () => {
    const attachments = [
      { name: 'file1.txt' },
      { name: 'file2.jpg' }
    ];
    render(<AttachmentLoader attachments={attachments} />);

    expect(screen.getByText('Reading 2 attachments')).toBeInTheDocument();
  });

  it('applies custom className to the container', () => {
    const attachments = [{ name: 'test.txt' }];
    render(<AttachmentLoader attachments={attachments} className="custom-class" />);

    const container = screen.getByText('Reading test.txt').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});
