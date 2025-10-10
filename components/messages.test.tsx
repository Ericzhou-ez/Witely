import { render, screen } from '@testing-library/react';
import { Messages } from './messages';
import type { ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';

// Mock the useDataStream hook
jest.mock('./data-stream-provider', () => ({
  useDataStream: jest.fn(),
}));

const mockUseDataStream = useDataStream as jest.MockedFunction<typeof useDataStream>;

const mockMessages: ChatMessage[] = [];

const defaultProps = {
  chatId: 'test-chat',
  status: 'idle' as const,
  votes: undefined,
  messages: mockMessages,
  isReadonly: false,
  isArtifactVisible: false,
  selectedModelId: 'gpt-4',
  messagesContainerRef: { current: { scrollTo: jest.fn() } } as any,
  endRef: { current: null } as any,
  scrollToBottom: jest.fn(),
  hasSentMessage: false,
};

describe('Messages', () => {
  beforeEach(() => {
    mockUseDataStream.mockReturnValue(undefined);
  });

  it('renders greeting when there are no messages', () => {
    render(<Messages {...defaultProps} />);

    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.getByText('How can I help you today?')).toBeInTheDocument();
  });

  it('renders messages when provided', () => {
    const testMessage: ChatMessage = {
      id: '1',
      role: 'user',
      parts: [{ type: 'text', text: 'Hello' }],
    };
    const props = { ...defaultProps, messages: [testMessage] };

    render(<Messages {...props} />);

    expect(screen.getByTestId('message-user')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows thinking message when status is submitted and waiting for response', () => {
    const userMessage: ChatMessage = {
      id: '1',
      role: 'user',
      parts: [{ type: 'text', text: 'Hello' }],
    };
    const props = {
      ...defaultProps,
      messages: [userMessage],
      status: 'submitted' as const,
    };

    render(<Messages {...props} />);

    expect(screen.getByTestId('message-assistant-loading')).toBeInTheDocument();
  });
});
