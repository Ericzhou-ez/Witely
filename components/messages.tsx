import type { UseChatHelpers } from "@ai-sdk/react";
import equal from "fast-deep-equal";
import { memo, type RefObject, useEffect } from "react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { AttachmentLoader } from "./attachment-loader";
import { useDataStream } from "./data-stream-provider";
import { Conversation, ConversationContent } from "./elements/conversation";
import { Greeting } from "./greeting";
import { PreviewMessage, ThinkingMessage } from "./message";

type MessagesProps = {
  chatId: string;
  status: UseChatHelpers<ChatMessage>["status"];
  votes: Vote[] | undefined;
  messages: ChatMessage[];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
  messagesContainerRef: RefObject<HTMLDivElement>;
  endRef: RefObject<HTMLDivElement>;
  scrollToBottom: (behavior?: "smooth" | "instant") => void;
  hasSentMessage: boolean;
};

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  isReadonly,
  selectedModelId,
  messagesContainerRef,
  endRef: messagesEndRef,
  hasSentMessage,
}: MessagesProps) {
  useDataStream();

  useEffect(() => {
    if (status === "submitted") {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }
  }, [status, messagesContainerRef]);

  return (
    <div
      className="overscroll-behavior-contain -webkit-overflow-scrolling-touch flex-1 touch-pan-y overflow-y-scroll pt-10"
      ref={messagesContainerRef}
      style={{ overflowAnchor: "none" }}
    >
      <Conversation className="mx-auto flex min-w-0 max-w-3xl flex-col gap-4 md:gap-6">
        <ConversationContent className="flex flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
          {messages.length === 0 && <Greeting />}

          {messages.map((message, index) => (
            <PreviewMessage
              chatId={chatId}
              isLoading={
                status === "streaming" && messages.length - 1 === index
              }
              isReadonly={isReadonly}
              key={message.id}
              message={message}
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

          {(() => {
            if (selectedModelId === "chat-model-reasoning") {
              return null;
            }

            const lastMessage = messages.at(-1);
            const isWaitingForResponse =
              lastMessage?.role === "user" ||
              (lastMessage?.role === "assistant" &&
                !lastMessage.parts?.some(
                  (p) =>
                    (p.type === "text" && p.text) ||
                    (p.type === "reasoning" && p.text)
                ));

            if (!isWaitingForResponse) {
              return null;
            }

            const userMessage =
              lastMessage?.role === "assistant" ? messages.at(-2) : lastMessage;
            const attachments = userMessage?.parts.filter(
              (p) => p.type === "file"
            );

            return (
              <>
                {attachments && attachments.length > 0 && (
                  <AttachmentLoader
                    attachments={attachments.map((att: any) => ({
                      name: att.name,
                      mediaType: att.mediaType,
                    }))}
                    className="mx-auto w-full px-2 md:px-4"
                  />
                )}
                {status === "submitted" && <ThinkingMessage />}
              </>
            );
          })()}

          <div
            className="min-h-[10px] min-w-[10px] shrink-0"
            ref={messagesEndRef}
          />
        </ConversationContent>
      </Conversation>
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) {
    return true;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }
  if (prevProps.selectedModelId !== nextProps.selectedModelId) {
    return false;
  }
  if (prevProps.messages.length !== nextProps.messages.length) {
    return false;
  }
  if (!equal(prevProps.messages, nextProps.messages)) {
    return false;
  }
  if (!equal(prevProps.votes, nextProps.votes)) {
    return false;
  }

  return false;
});
