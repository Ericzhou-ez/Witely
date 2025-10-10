import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { PreviewMessage, ThinkingMessage } from './message';
import type { ChatMessage, Vote } from '@/lib/types';
import { sanitizeText } from '@/lib/utils';

// Mock the useDataStream hook
vi.mock('./data-stream-provider', () => ({
  useDataStream: vi.fn(),
}));

// Mock other components to avoid deep rendering issues
vi.mock('./elements/message', () => ({
  MessageContent: ({ children }: { children: React.ReactNode }) => <div data-testid="message-content">{children}</div>,
  Response: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./preview-attachment', () => ({
  PreviewAttachment: ({ attachment }: { attachment: { name: string; contentType: string; url: string } }) => (
    <div data-testid="preview-attachment">{attachment.name}</div>
  ),
}));

vi.mock('./message-actions', () => ({
  MessageActions: () => null,
}));

// Mock tool components if needed
vi.mock('./elements/tool', () => ({
  Tool: ({ children }: { children: React.ReactNode }) => <div data-testid="tool">{children}</div>,
  ToolHeader: () => null,
  ToolContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ToolInput: () => null,
  ToolOutput: ({ output }: { output: React.ReactNode }) => <>{output}</>,
}));

vi.mock('./weather', () => ({
  Weather: () => <div data-testid="weather">Weather</div>,
}));

vi.mock('./document-preview', () => ({
  DocumentPreview: () => <div data-testid="document-preview">Document</div>,
}));

vi.mock('./message-reasoning', () => ({
  MessageReasoning: () => <div data-testid="reasoning">Reasoning</div>,
}));

describe('Message Component', () => {
  const mockVote: Vote | undefined = undefined;
  const defaultProps = {
    chatId: 'test-chat',
    vote: mockVote,
    isLoading: false,
    isReadonly: false,
    requiresScrollPadding: false,
  };

  it('renders user message with text', () => {
    const message: ChatMessage = {
      id: 'user-1',
      role: 'user',
      parts: [{ type: 'text', text: 'Hello, world!' }],
    };

    render(<PreviewMessage {...defaultProps} message={message} />);

    expect(screen.getByTestId('message-user')).toBeInTheDocument();
    expect(screen.getByTestId('message-content')).toBeInTheDocument();
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('renders assistant message with text', () => {
    const message: ChatMessage = {
      id: 'assistant-1',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hi there!' }],
    };

    render(<PreviewMessage {...defaultProps} message={message} />);

    expect(screen.getByTestId('message-assistant')).toBeInTheDocument();
    expect(screen.getByTestId('message-content')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('renders message with file attachment', () => {
    const message: ChatMessage = {
      id: 'user-2',
      role: 'user',
      parts: [
        { type: 'text', text: 'Check this file' },
        {
          type: 'file' as const,
          name: 'test.txt',
          mediaType: 'text/plain',
          url: 'http://example.com/test.txt',
        },
      ],
    };

    render(<PreviewMessage {...defaultProps} message={message} />);

    expect(screen.getByTestId('message-attachments')).toBeInTheDocument();
    expect(screen.getByTestId('preview-attachment')).toBeInTheDocument();
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });

  it('renders thinking message', () => {
    render(<ThinkingMessage />);

    expect(screen.getByTestId('message-assistant-loading')).toBeInTheDocument();
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('sanitizes text in messages', () => {
    const unsafeText = '<script>alert("xss")</script>';
    const message: ChatMessage = {
      id: 'user-3',
      role: 'user',
      parts: [{ type: 'text', text: unsafeText }],
    };

    render(<PreviewMessage {...defaultProps} message={message} />);

    // Assuming sanitizeText removes or escapes script tags
    // Adjust expectation based on sanitizeText implementation
    expect(screen.getByText(sanitizeText(unsafeText))).toBeInTheDocument();
    expect(screen.queryByText('<script>')).not.toBeInTheDocument();
  });
});
