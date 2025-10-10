import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { motion } from "framer-motion";
import { memo } from "react";
import { useMessages } from "@/hooks/use-messages";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import type { UIArtifact } from "./artifact";
import { PreviewMessage, ThinkingMessage } from "./message";

/**
 * Displays a list of messages in an artifact context, handling loading states, voting, and smooth scrolling.
 * Optimized with memoization to prevent unnecessary re-renders during streaming.
 *
 * @param props - Component props including chat details and messages
 * @returns {JSX.Element} The rendered messages container with scroll behavior
 */
type ArtifactMessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  artifactStatus: UIArtifact["status"];
};

/**
 * Pure rendering function for ArtifactMessages component.
 * Manages the display of messages, thinking indicator, and scroll end sentinel.
 *
 * @param props - The props for rendering messages
 * @returns {JSX.Element} JSX for the messages list
 */
function PureArtifactMessages({
  chatId,
  status,
  votes,
  messages,
  isReadonly,
}: ArtifactMessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    status,
  });

  return (
    <div
      className="flex flex-1 flex-col items-center gap-4 overflow-y-scroll px-4 pt-20 pb-4"
      data-testid="artifact-messages-container"
      ref={messagesContainerRef}
    >
      {messages.map((message, index) => (
        <PreviewMessage
          chatId={chatId}
          isLoading={status === "streaming" && index === messages.length - 1}
          isReadonly={isReadonly}
          key={message.id}
          message={message}
          data-testid={`preview-message-${message.id}`}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages.at(-1)?.role === "user" && <ThinkingMessage data-testid="thinking-message" />}

      <motion.div
        className="min-h-[24px] min-w-[24px] shrink-0"
        data-testid="messages-end-sentinel"
        onViewportEnter={onViewportEnter}
        onViewportLeave={onViewportLeave}
        ref={messagesEndRef}
      />
    </div>
  );
}

/**
 * Determines if props have changed sufficiently to warrant a re-render.
 * Skips re-renders during streaming and checks for meaningful differences in status, messages, and votes.
 *
 * @param prevProps - Previous props
 * @param nextProps - Next props
 * @returns {boolean} True if props are equal (no re-render needed)
 */
function areEqual(
  prevProps: ArtifactMessagesProps,
  nextProps: ArtifactMessagesProps
) {
  if (
    prevProps.artifactStatus === "streaming" &&
    nextProps.artifactStatus === "streaming"
  ) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.status && nextProps.status) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return true;
}

/**
 * Memoized ArtifactMessages component for performance optimization.
 */
export const ArtifactMessages = memo(PureArtifactMessages, areEqual);
