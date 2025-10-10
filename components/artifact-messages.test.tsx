import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ArtifactMessages } from './artifact-messages';
import type { ChatMessage } from '@/lib/types';
import type { Vote } from '@/lib/db/schema';

// Mock dependencies
jest.mock('@/hooks/use-messages', () => ({
  useMessages: jest.fn(() => ({
    containerRef: { current: null },
    endRef: { current: null },
    onViewportEnter: jest.fn(),
    onViewportLeave: jest.fn(),
    hasSentMessage: false,
  })),
}));

jest.mock('./message', () => ({
  PreviewMessage: jest.fn(
    ({ message, ...props }: { message: ChatMessage }) => (
      <div data-testid="preview-message" data-message-id={message.id}>
        Mock Preview for {message.content}
      </div>
    )
  ),
  ThinkingMessage: jest.fn(() => <div data-testid="thinking-message">Thinking...</div>),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ref, onViewportEnter, onViewportLeave, ...props }: any) => (
      <div ref={ref} onViewportEnter={onViewportEnter} onViewportLeave={onViewportLeave} {...props}>
        {children}
      </div>
    ),
  },
}));

jest.mock('@ai-sdk/react', () => ({
  UseChatHelpers: {},
}));

describe('ArtifactMessages', () => {
  const defaultProps = {
    chatId: 'test-chat',
    status: 'idle' as const,
    votes: [] as Vote[],
    messages: [] as ChatMessage[],
    setMessages: jest.fn(),
    regenerate: jest.fn(),
    isReadonly: false,
    artifactStatus: 'idle' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing with no messages', () => {
    render(<ArtifactMessages {...defaultProps} />);
    expect(screen.queryByTestId('preview-message')).not.toBeInTheDocument();
    expect(screen.queryByTestId('thinking-message')).not.toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello' },
    ];
    render(<ArtifactMessages {...defaultProps} messages={messages} />);

    expect(screen.getByTestId('preview-message')).toBeInTheDocument();
    expect(screen.getByText('Mock Preview for Hello')).toBeInTheDocument();
  });

  it('renders multiple messages', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi there' },
    ];
    render(<ArtifactMessages {...defaultProps} messages={messages} />);

    const previews = screen.getAllByTestId('preview-message');
    expect(previews).toHaveLength(2);
    expect(screen.getByText('Mock Preview for Hello')).toBeInTheDocument();
    expect(screen.getByText('Mock Preview for Hi there')).toBeInTheDocument();
  });

  it('renders ThinkingMessage when status is submitted and last message is from user', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello' },
    ];
    render(<ArtifactMessages {...defaultProps} messages={messages} status="submitted" />);

    expect(screen.getByTestId('thinking-message')).toBeInTheDocument();
    expect(screen.getByText('Thinking...')).toBeInTheDocument();
  });

  it('does not render ThinkingMessage if last message is not from user', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'assistant', content: 'Hi' },
    ];
    render(<ArtifactMessages {...defaultProps} messages={messages} status="submitted" />);

    expect(screen.queryByTestId('thinking-message')).not.toBeInTheDocument();
  });

  it('does not render ThinkingMessage if no messages', () => {
    render(<ArtifactMessages {...defaultProps} status="submitted" />);

    expect(screen.queryByTestId('thinking-message')).not.toBeInTheDocument();
  });

  it('passes correct props to PreviewMessage', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello' },
    ];
    const mockVote = { messageId: '1', value: 1 } as Vote;
    render(
      <ArtifactMessages
        {...defaultProps}
        messages={messages}
        votes={[mockVote]}
        status="in-progress"
        isReadonly={true}
      />
    );

    expect(PreviewMessage).toHaveBeenCalledWith(
      {
        chatId: 'test-chat',
        isLoading: false,
        isReadonly: true,
        key: '1',
        message: messages[0],
        requiresScrollPadding: false,
        vote: mockVote,
      },
      {}
    );
  });

  it('memoization prevents unnecessary re-renders with same props', () => {
    const messages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello' },
    ];
    const { rerender } = render(<ArtifactMessages {...defaultProps} messages={messages} />);

    const previewMock = PreviewMessage as jest.Mock;
    const initialCalls = previewMock.mock.calls.length;

    rerender(<ArtifactMessages {...defaultProps} messages={messages} />);

    // Since props are equal, the component shouldn't re-render, so mocks shouldn't be called again
    expect(previewMock.mock.calls.length).toBe(initialCalls);
  });

  it('re-renders when messages change', () => {
    const initialMessages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello' },
    ];
    const newMessages: ChatMessage[] = [
      { id: '1', role: 'user', content: 'Hello' },
      { id: '2', role: 'assistant', content: 'Hi' },
    ];

    const { rerender } = render(<ArtifactMessages {...defaultProps} messages={initialMessages} />);

    const previewMock = PreviewMessage as jest.Mock;
    const initialCalls = previewMock.mock.calls.length;

    rerender(<ArtifactMessages {...defaultProps} messages={newMessages} />);

    expect(previewMock.mock.calls.length).toBeGreaterThan(initialCalls);
  });
});
