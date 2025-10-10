import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DragDropWrapper } from './drag-drop-wrapper';

jest.mock('./file-drop-overlay', () => ({
  FileDropOverlay: ({ isDragging, selectedModelId }: { isDragging: boolean; selectedModelId: string }) => (
    <div
      data-testid="overlay"
      data-is-dragging={isDragging.toString()}
      data-model-id={selectedModelId}
    >
      Mock Overlay
    </div>
  ),
}));

describe('DragDropWrapper', () => {
  const mockOnFilesDropped = jest.fn().mockResolvedValue(undefined);
  const selectedModelId = 'gpt-4';
  const children = <div data-testid="children">Child content</div>;

  beforeEach(() => {
    mockOnFilesDropped.mockClear();
  });

  it('renders children and overlay without dragging', () => {
    render(
      <DragDropWrapper selectedModelId={selectedModelId} onFilesDropped={mockOnFilesDropped}>
        {children}
      </DragDropWrapper>
    );

    expect(screen.getByTestId('children')).toBeInTheDocument();
    expect(screen.getByTestId('overlay')).toBeInTheDocument();
    expect(screen.getByTestId('overlay')).toHaveAttribute('data-is-dragging', 'false');
    expect(screen.getByTestId('overlay')).toHaveAttribute('data-model-id', selectedModelId);
  });

  it('sets isDragging to true on drag enter with files', () => {
    const { container } = render(
      <DragDropWrapper selectedModelId={selectedModelId} onFilesDropped={mockOnFilesDropped}>
        {children}
      </DragDropWrapper>
    );

    const div = container.querySelector('div')!; // The wrapper div
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const mockFiles = [mockFile];
    const dataTransfer = {
      items: mockFiles.map(file => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      })),
      files: mockFiles,
      types: ['Files'],
    };

    fireEvent.dragEnter(div, { dataTransfer });

    expect(screen.getByTestId('overlay')).toHaveAttribute('data-is-dragging', 'true');
  });

  it('handles multiple drag enters and leaves with counter', () => {
    const { container } = render(
      <DragDropWrapper selectedModelId={selectedModelId} onFilesDropped={mockOnFilesDropped}>
        {children}
      </DragDropWrapper>
    );

    const div = container.querySelector('div')!;
    const mockFile = new File(['test'], 'test.txt');
    const mockFiles = [mockFile];
    const dataTransfer = {
      items: mockFiles.map(f => ({ kind: 'file', type: f.type, getAsFile: () => f })),
      files: mockFiles,
      types: ['Files'],
    };

    // First enter
    fireEvent.dragEnter(div, { dataTransfer });
    expect(screen.getByTestId('overlay')).toHaveAttribute('data-is-dragging', 'true');

    // Second enter
    fireEvent.dragEnter(div, { dataTransfer });
    expect(screen.getByTestId('overlay')).toHaveAttribute('data-is-dragging', 'true');

    // First leave
    fireEvent.dragLeave(div, { dataTransfer });
    expect(screen.getByTestId('overlay')).toHaveAttribute('data-is-dragging', 'true'); // counter > 0

    // Second leave
    fireEvent.dragLeave(div, { dataTransfer });
    expect(screen.getByTestId('overlay')).toHaveAttribute('data-is-dragging', 'false'); // counter == 0
  });

  it('prevents default on drag over', () => {
    const { container } = render(
      <DragDropWrapper selectedModelId={selectedModelId} onFilesDropped={mockOnFilesDropped}>
        {children}
      </DragDropWrapper>
    );

    const div = container.querySelector('div')!;
    const event = fireEvent.dragOver(div);

    // Since preventDefault is called, but fireEvent doesn't throw, we can assume it's handled
    expect(event.defaultPrevented).toBe(true); // Note: fireEvent returns the event, but defaultPrevented might not be set this way
  });

  it('calls onFilesDropped on drop with files and resets state', async () => {
    const { container } = render(
      <DragDropWrapper selectedModelId={selectedModelId} onFilesDropped={mockOnFilesDropped}>
        {children}
      </DragDropWrapper>
    );

    const div = container.querySelector('div')!;
    const mockFile = new File(['test'], 'test.txt');
    const mockFiles = [mockFile];
    const dataTransfer = {
      files: mockFiles,
      items: mockFiles.map(f => ({ kind: 'file', type: f.type, getAsFile: () => f })),
      types: ['Files'],
    };

    // Enter to set dragging
    fireEvent.dragEnter(div, { dataTransfer });
    expect(screen.getByTestId('overlay')).toHaveAttribute('data-is-dragging', 'true');

    // Drop
    fireEvent.drop(div, { dataTransfer });

    await waitFor(() => {
      expect(mockOnFilesDropped).toHaveBeenCalledWith(mockFiles);
    });

    expect(screen.getByTestId('overlay')).toHaveAttribute('data-is-dragging', 'false');
  });

  it('does not call onFilesDropped if no files dropped', async () => {
    const { container } = render(
      <DragDropWrapper selectedModelId={selectedModelId} onFilesDropped={mockOnFilesDropped}>
        {children}
      </DragDropWrapper>
    );

    const div = container.querySelector('div')!;
    const dataTransfer = {
      files: [],
      items: [],
      types: [],
    };

    fireEvent.drop(div, { dataTransfer });

    await waitFor(() => {
      expect(mockOnFilesDropped).not.toHaveBeenCalled();
    });
  });

  it('handles drag enter without files (no state change)', () => {
    const { container } = render(
      <DragDropWrapper selectedModelId={selectedModelId} onFilesDropped={mockOnFilesDropped}>
        {children}
      </DragDropWrapper>
    );

    const div = container.querySelector('div')!;
    const dataTransfer = {
      items: [],
      files: [],
      types: [],
    };

    fireEvent.dragEnter(div, { dataTransfer });

    expect(screen.getByTestId('overlay')).toHaveAttribute('data-is-dragging', 'false');
  });
});
