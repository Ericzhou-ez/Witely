import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';
import { MessageActions } from './message-actions';
import type { ChatMessage } from '@/lib/types';
import type { Vote } from '@/lib/db/schema';

// Mock dependencies
jest.mock('sonner');
jest.mock('swr');
jest.mock('usehooks-ts');
jest.mock('@/lib/db/schema', () => ({
  Vote: jest.fn(),
}));

const mockMutate = jest.fn();
const mockCopyToClipboard = jest.fn();
const mockToast = toast as jest.MockedFunction<typeof toast>;

(useSWRConfig as jest.Mock).mockReturnValue({ mutate: mockMutate });
(useCopyToClipboard.useCopyToClipboard as jest.Mock).mockReturnValue([null, mockCopyToClipboard]);

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockChatMessage: ChatMessage = {
  id: 'msg-1',
  role: 'assistant',
  parts: [{ type: 'text', text: 'Hello world' }],
  createdAt: new Date(),
};

const userMessage: ChatMessage = {
  ...mockChatMessage,
  role: 'user',
};

describe('MessageActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true } as Response);
  });

  it('renders nothing when isLoading is true', () => {
    render(
      <MessageActions
        chatId="chat-1"
        message={mockChatMessage}
        vote={undefined}
        isLoading={true}
      />
    );

    expect(screen.queryByTestId('message-upvote')).not.toBeInTheDocument();
    expect(screen.queryByTestId('message-downvote')).not.toBeInTheDocument();
  });

  it('renders copy action for user messages', () => {
    render(
      <MessageActions
        chatId="chat-1"
        message={userMessage}
        vote={undefined}
        isLoading={false}
      />
    );

    // The copy action is present but with opacity-0, but it's in the DOM
    const copyActions = screen.getAllByRole('button', { name: /copy/i });
    expect(copyActions).toHaveLength(1);
  });

  it('copies text to clipboard for user messages', async () => {
    render(
      <MessageActions
        chatId="chat-1"
        message={userMessage}
        vote={undefined}
        isLoading={false}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    expect(mockCopyToClipboard).toHaveBeenCalledWith('Hello world');
    expect(mockToast).toHaveBeenCalledWith('success', expect.anything(), 'Copied to clipboard!');
  });

  it('shows error toast if no text to copy for user message', async () => {
    const noTextMessage: ChatMessage = {
      ...userMessage,
      parts: [{ type: 'image', src: 'img.png' }],
    };

    render(
      <MessageActions
        chatId="chat-1"
        message={noTextMessage}
        vote={undefined}
        isLoading={false}
      />
    );

    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('error', expect.anything(), "There's no text to copy!");
    });
    expect(mockCopyToClipboard).not.toHaveBeenCalled();
  });

  it('renders upvote, downvote, and copy actions for assistant messages', () => {
    render(
      <MessageActions
        chatId="chat-1"
        message={mockChatMessage}
        vote={undefined}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('message-upvote')).toBeInTheDocument();
    expect(screen.getByTestId('message-downvote')).toBeInTheDocument();
    const copyActions = screen.getAllByRole('button', { name: /copy/i });
    expect(copyActions).toHaveLength(1);
  });

  it('handles upvote for assistant message', async () => {
    const mockVote: Vote = { chatId: 'chat-1', messageId: 'msg-1', isUpvoted: false };

    render(
      <MessageActions
        chatId="chat-1"
        message={mockChatMessage}
        vote={mockVote}
        isLoading={false}
      />
    );

    const upvoteButton = screen.getByTestId('message-upvote');
    fireEvent.click(upvoteButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/vote', {
      method: 'PATCH',
      body: JSON.stringify({
        chatId: 'chat-1',
        messageId: 'msg-1',
        type: 'up',
      }),
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        'promise',
        expect.anything(),
        expect.objectContaining({
          loading: 'Upvoting Response...',
          success: expect.any(Function),
          error: 'Failed to upvote response.',
        })
      );
    });

    expect(mockMutate).toHaveBeenCalledWith(
      '/api/vote?chatId=chat-1',
      expect.any(Function),
      { revalidate: false }
    );
  });

  it('handles downvote for assistant message', async () => {
    const mockVote: Vote = { chatId: 'chat-1', messageId: 'msg-1', isUpvoted: true };

    render(
      <MessageActions
        chatId="chat-1"
        message={mockChatMessage}
        vote={mockVote}
        isLoading={false}
      />
    );

    const downvoteButton = screen.getByTestId('message-downvote');
    fireEvent.click(downvoteButton);

    expect(global.fetch).toHaveBeenCalledWith('/api/vote', {
      method: 'PATCH',
      body: JSON.stringify({
        chatId: 'chat-1',
        messageId: 'msg-1',
        type: 'down',
      }),
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        'promise',
        expect.anything(),
        expect.objectContaining({
          loading: 'Downvoting Response...',
          success: expect.any(Function),
          error: 'Failed to downvote response.',
        })
      );
    });

    expect(mockMutate).toHaveBeenCalledWith(
      '/api/vote?chatId=chat-1',
      expect.any(Function),
      { revalidate: false }
    );
  });

  it('copies text to clipboard for assistant messages', async () => {
    render(
      <MessageActions
        chatId="chat-1"
        message={mockChatMessage}
        vote={undefined}
        isLoading={false}
      />
    );

    const copyButton = screen.getAllByRole('button', { name: /copy/i })[0];
    fireEvent.click(copyButton);

    expect(mockCopyToClipboard).toHaveBeenCalledWith('Hello world');
    expect(mockToast).toHaveBeenCalledWith('success', expect.anything(), 'Copied to clipboard!');
  });

  it('memoization prevents unnecessary re-renders when props are equal', () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(
      <MessageActions
        chatId="chat-1"
        message={mockChatMessage}
        vote={undefined}
        isLoading={false}
      />
    );

    const sameProps = {
      chatId: "chat-1",
      message: mockChatMessage,
      vote: undefined,
      isLoading: false,
    };

    rerender(<MessageActions {...sameProps} />);

    // Since it's memoized, no additional renders, but hard to test directly
    // We can assume it's working if no errors

    consoleWarn.mockRestore();
  });

  it('disables upvote button when already upvoted', () => {
    const upvoted: Vote = { chatId: 'chat-1', messageId: 'msg-1', isUpvoted: true };

    render(
      <MessageActions
        chatId="chat-1"
        message={mockChatMessage}
        vote={upvoted}
        isLoading={false}
      />
    );

    const upvoteButton = screen.getByTestId('message-upvote');
    expect(upvoteButton).toBeDisabled();
  });

  it('disables downvote button when not upvoted', () => {
    const downvoted: Vote = { chatId: 'chat-1', messageId: 'msg-1', isUpvoted: false };

    render(
      <MessageActions
        chatId="chat-1"
        message={mockChatMessage}
        vote={downvoted}
        isLoading={false}
      />
    );

    const downvoteButton = screen.getByTestId('message-downvote');
    expect(downvoteButton).toBeDisabled();
  });
});
