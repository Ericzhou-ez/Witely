import equal from "fast-deep-equal";
import { memo } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useCopyToClipboard } from "usehooks-ts";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { Action, Actions } from "./elements/actions";
import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from "./icons";

/**
 * Renders actions for a chat message, including copy, upvote, and downvote.
 * For user messages, only shows copy on hover.
 * For assistant messages, shows vote buttons and copy.
 *
 * @param {Object} props - Component props
 * @param {string} props.chatId - The unique identifier for the chat session.
 * @param {ChatMessage} props.message - The message object containing role, id, and parts.
 * @param {Vote | undefined} props.vote - The current vote status for this message.
 * @param {boolean} props.isLoading - Indicates if the message is currently loading.
 * @returns {JSX.Element | null} The actions UI or null if loading.
 */
export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();

  if (isLoading) {
    return null;
  }

  const textFromParts = message.parts
    ?.filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  const handleCopy = async () => {
    if (!textFromParts) {
      toast.error("There's no text to copy!");
      return;
    }

    await copyToClipboard(textFromParts);
    toast.success("Copied to clipboard!");
  };

  const handleVote = (type: 'up' | 'down') => () => {
    const isUp = type === 'up';
    const voteType = type;
    const promise = fetch("/api/vote", {
      method: "PATCH",
      body: JSON.stringify({
        chatId,
        messageId: message.id,
        type: voteType,
      }),
    });

    toast.promise(promise, {
      loading: `${isUp ? 'Up' : 'Down'}voting Response...`,
      success: () => {
        mutate<Vote[]>(
          `/api/vote?chatId=${chatId}`,
          (currentVotes) => {
            if (!currentVotes) {
              return [];
            }

            const votesWithoutCurrent = currentVotes.filter(
              (currentVote) => currentVote.messageId !== message.id
            );

            return [
              ...votesWithoutCurrent,
              {
                chatId,
                messageId: message.id,
                isUpvoted: isUp,
              },
            ];
          },
          { revalidate: false }
        );

        return `${isUp ? 'Up' : 'Down'}voted Response!`;
      },
      error: `Failed to ${isUp ? 'up' : 'down'}vote response.`,
    });
  };

  // User messages get copy action on hover
  if (message.role === "user") {
    return (
      <Actions className="-mr-0.5 justify-end">
        <Action
          data-testid="user-message-copy"
          className="opacity-0 transition-opacity group-hover/message:opacity-100"
          onClick={handleCopy}
          tooltip="Copy"
        >
          <CopyIcon />
        </Action>
      </Actions>
    );
  }

  return (
    <Actions className="-ml-0.5">
      <Action
        data-testid="message-upvote"
        disabled={vote?.isUpvoted}
        onClick={handleVote('up')}
        tooltip="Upvote Response"
      >
        <ThumbUpIcon />
      </Action>

      <Action
        data-testid="message-downvote"
        disabled={vote && !vote.isUpvoted}
        onClick={handleVote('down')}
        tooltip="Downvote Response"
      >
        <ThumbDownIcon />
      </Action>

      <Action
        data-testid="assistant-message-copy"
        className="opacity-0 transition-opacity group-hover/message:opacity-100"
        onClick={handleCopy}
        tooltip="Copy"
      >
        <CopyIcon />
      </Action>
    </Actions>
  );
}

/**
 * Memoized version of PureMessageActions to optimize re-renders.
 * Compares vote and isLoading props for equality.
 * Note: Does not compare chatId or message as they are assumed stable.
 */
export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) {
      return false;
    }
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }

    return true;
  }
);
