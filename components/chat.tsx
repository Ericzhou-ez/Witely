"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast as toastFn } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { ChatHeader } from "@/components/chat-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  initialArtifactData,
  useArtifact,
  useArtifactSelector,
} from "@/hooks/use-artifact";
import { useAutoResume } from "@/hooks/use-auto-resume";
import { useChatVisibility } from "@/hooks/use-chat-visibility";
import { useMessages } from "@/hooks/use-messages";
import type { Vote } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { fetcher, fetchWithErrorHandlers, generateUUID } from "@/lib/utils";
import { Artifact } from "./artifact";
import { useDataStream } from "./data-stream-provider";
import { DragDropWrapper } from "./drag-drop-wrapper";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { getChatHistoryPaginationKey } from "./sidebar-history";
import type { VisibilityType } from "./visibility-selector";

/**
 * Main chat component that handles the conversation interface, including messages, file uploads, and AI interactions.
 *
 * @param {Object} props - The component props.
 * @param {string} props.id - Unique identifier for the chat session.
 * @param {import("@/lib/types").ChatMessage[]} props.initialMessages - Array of initial messages to populate the chat.
 * @param {string} props.initialChatModel - The ID of the initial AI model to use.
 * @param {import("./visibility-selector").VisibilityType} props.initialVisibilityType - Initial visibility setting (public/private).
 * @param {boolean} props.isReadonly - Flag to render the chat in read-only mode.
 * @param {boolean} props.autoResume - Whether to automatically resume interrupted streams.
 * @param {import("@/lib/usage").AppUsage} [props.initialLastContext] - Optional initial usage statistics.
 * @returns {JSX.Element} The rendered chat UI component.
 */
export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: AppUsage;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();
  const { setArtifact } = useArtifact();

  const [input, setInput] = useState<string>("");
  const [usage, setUsage] = useState<AppUsage | undefined>(initialLastContext);
  const [showCreditCardAlert, setShowCreditCardAlert] = useState(false);
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);
  const currentModelIdRef = useRef(currentModelId);

  // Constants for better testability and readability
  const THROTTLE_DELAY = 100;
  const CREDIT_CARD_ERROR_MSG = "AI Gateway requires a valid credit card";

  useEffect(() => {
    currentModelIdRef.current = currentModelId;
  }, [currentModelId]);

  // Reset artifact state when navigating to a different chat
  // biome-ignore lint/correctness/useExhaustiveDependencies: We intentionally include 'id' to reset the artifact when chat changes
  useEffect(() => {
    setArtifact(initialArtifactData);
  }, [id, setArtifact]);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: THROTTLE_DELAY,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest(request) {
        return {
          body: {
            id: request.id,
            message: request.messages.at(-1),
            selectedChatModel: currentModelIdRef.current,
            selectedVisibilityType: visibilityType,
            ...request.body,
          },
        };
      },
    }),
    // Handle incoming data parts from the AI stream, update data stream and usage stats
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if (dataPart.type === "data-usage") {
        setUsage(dataPart.data);
      }
    },
    // Invalidate and refetch chat history cache after stream completion
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    // Handle errors from the chat SDK, including specific cases like credit card requirements
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        // Check if it's a credit card error
        if (
          error.message?.includes(CREDIT_CARD_ERROR_MSG)
        ) {
          setShowCreditCardAlert(true);
        } else {
          toastFn.error(error.message);
        }
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: "user" as const,
        parts: [{ type: "text", text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Vote[]>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher
  );

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    status,
  });

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  const handleFilesDropped = useCallback(
    async (files: File[]) => {
      const { validateAndUploadFiles } = await import("@/lib/ai/file-upload");
      const { chatModels } = await import("@/lib/ai/models");

      const selectedModel = chatModels.find((m) => m.id === currentModelId);

      if (!selectedModel) {
        toastFn.error("Selected model not found");
        return;
      }

      try {
        const uploadedAttachments = await validateAndUploadFiles(
          files,
          selectedModel,
          attachments.length
        );

        if (uploadedAttachments.length > 0) {
          setAttachments((currentAttachments) => [
            ...currentAttachments,
            ...uploadedAttachments,
          ]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred while uploading files.';
        toastFn.error(`Failed to upload files: ${errorMessage}`);
        console.error('File upload error:', error);
      }
    },
    [currentModelId, attachments.length]
  );

  return (
    <>
      <DragDropWrapper
        onFilesDropped={handleFilesDropped}
        selectedModelId={currentModelId}
      >
        <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
          <ChatHeader
            chatId={id}
            isReadonly={isReadonly}
            selectedVisibilityType={initialVisibilityType}
          />

          <Messages
            chatId={id}
            endRef={messagesEndRef}
            hasSentMessage={hasSentMessage}
            isArtifactVisible={isArtifactVisible}
            isReadonly={isReadonly}
            messages={messages}
            messagesContainerRef={messagesContainerRef}
            scrollToBottom={scrollToBottom}
            selectedModelId={initialChatModel}
            status={status}
            votes={votes}
          />

          <div className="sticky bottom-0 z-10 mx-auto flex w-full max-w-3xl gap-2 border-t-0 px-2 md:px-4">
            {!isReadonly && (
              <MultimodalInput
                attachments={attachments}
                chatId={id}
                input={input}
                isAtBottom={isAtBottom}
                messages={messages}
                onModelChange={setCurrentModelId}
                scrollToBottom={scrollToBottom}
                selectedModelId={currentModelId}
                selectedVisibilityType={visibilityType}
                sendMessage={sendMessage}
                setAttachments={setAttachments}
                setInput={setInput}
                setMessages={setMessages}
                status={status}
                stop={stop}
                usage={usage}
              />
            )}
          </div>
        </div>
      </DragDropWrapper>

      <Artifact
        attachments={attachments}
        chatId={id}
        input={input}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={currentModelId}
        selectedVisibilityType={visibilityType}
        sendMessage={sendMessage}
        setAttachments={setAttachments}
        setInput={setInput}
        setMessages={setMessages}
        status={status}
        stop={stop}
        votes={votes}
      />

      <AlertDialog
        onOpenChange={setShowCreditCardAlert}
        open={showCreditCardAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate AI Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              This application requires{" "}
              {process.env.NODE_ENV === "production" ? "the owner" : "you"} to
              activate Vercel AI Gateway.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                window.open(
                  "https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card",
                  "_blank"
                );
                window.location.href = "/";
              }}
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
