"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { Trigger } from "@radix-ui/react-select";
import type { UIMessage } from "ai";
import equal from "fast-deep-equal";
import { ArrowDownIcon } from "lucide-react";
import {
  type ChangeEvent,
  type Dispatch,
  memo,
  type SetStateAction,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { saveChatModelAsCookie } from "@/app/(chat)/actions";
import { SelectItem } from "@/components/ui/select";
import { isModelCompatibleWithAttachments } from "@/lib/ai/file-compatibility";
import { chatModels } from "@/lib/ai/models";
import { myProvider } from "@/lib/ai/providers";
import type { Attachment, ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { Context } from "./elements/context";
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "./elements/prompt-input";
import { ArrowUpIcon, ChevronDownIcon, PaperclipIcon, StopIcon } from "./icons";
import { PreviewAttachment } from "./preview-attachment";
import { SuggestedActions } from "./suggested-actions";
import { Button } from "./ui/button";
import type { VisibilityType } from "./visibility-selector";

/**
 * Pure multimodal input component without memoization.
 * Handles text input, file attachments, model selection, and submission.
 *
 * @param {Object} props - Component props
 * @param {string} props.chatId - The ID of the current chat
 * @param {string} props.input - Current input text
 * @param {Dispatch<SetStateAction<string>>} props.setInput - Setter for input text
 * @param {UseChatHelpers<ChatMessage>["status"]} props.status - Chat status
 * @param {() => void} props.stop - Function to stop the current generation
 * @param {Attachment[]} props.attachments - List of attached files
 * @param {Dispatch<SetStateAction<Attachment[]>>} props.setAttachments - Setter for attachments
 * @param {UIMessage[]} props.messages - Current messages in the chat
 * @param {UseChatHelpers<ChatMessage>["setMessages"]} props.setMessages - Setter for messages
 * @param {UseChatHelpers<ChatMessage>["sendMessage"]} props.sendMessage - Function to send message
 * @param {string} [props.className] - Optional CSS class
 * @param {VisibilityType} props.selectedVisibilityType - Selected visibility
 * @param {string} props.selectedModelId - Selected model ID
 * @param {(modelId: string) => void} [props.onModelChange] - Optional model change handler
 * @param {AppUsage} [props.usage] - Usage data
 * @param {boolean} [props.isAtBottom] - Whether scrolled to bottom
 * @param {(behavior?: "smooth" | "instant") => void} [props.scrollToBottom] - Scroll to bottom function
 * @returns {JSX.Element} The rendered component
 */
function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType,
  selectedModelId,
  onModelChange,
  usage,
  isAtBottom,
  scrollToBottom,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>["status"];
  stop: () => void;
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;
  messages: UIMessage[];
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  usage?: AppUsage;
  isAtBottom?: boolean;
  scrollToBottom?: (behavior?: "smooth" | "instant") => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [adjustHeight]);

  const resetHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  }, []);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    "input",
    ""
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || "";
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjustHeight, localStorageInput, setInput]);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);

  const submitForm = useCallback(() => {
    if (!input.trim() && attachments.length === 0) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    const parts: Array<
      | { type: "file"; url: string; name: string; mediaType: string }
      | { type: "text"; text: string }
    > = [
      ...attachments.map((attachment) => ({
        type: "file" as const,
        url: attachment.url,
        name: attachment.name,
        mediaType: attachment.contentType,
      })),
    ];

    // Only add text part if user actually typed something
    if (input.trim()) {
      parts.push({
        type: "text",
        text: input.trim(),
      });
    }

    window.history.replaceState({}, "", `/chat/${chatId}`);

    sendMessage({
      role: "user",
      parts,
    });

    setAttachments([]);
    setLocalStorageInput("");
    resetHeight();
    setInput("");

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    resetHeight,
  ]);

  // Note: uploadFile utility is now imported from shared module

  const _modelResolver = useMemo(() => {
    return myProvider.languageModel(selectedModelId);
  }, [selectedModelId]);

  const contextProps = useMemo(
    () => ({
      usage,
    }),
    [usage]
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      // Import dependencies
      const { validateAndUploadFiles } = await import("@/lib/ai/file-upload");
      const { chatModels: allChatModels } = await import("@/lib/ai/models");

      const selectedModel = allChatModels.find((m) => m.id === selectedModelId);

      if (!selectedModel) {
        toast.error("Selected model not found");
        return;
      }

      setUploadQueue(files.map((file) => file.name));

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
        toast.error("Failed to upload files");
      } finally {
        setUploadQueue([]);
      }
    }, 
    [setAttachments, selectedModelId, attachments.length]
  );

  return (
    <div className={cn("relative flex w-full flex-col gap-4", className)}>
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
            sendMessage={sendMessage}
          />
        )}

      <input
        className="-top-4 -left-4 pointer-events-none fixed size-0.5 opacity-0"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        tabIndex={-1}
        type="file"
      />

      {scrollToBottom && (
        <button
          aria-label="Scroll to bottom"
          className={cn(
            "-translate-x-1/2 -top-10 absolute left-1/2 z-10 rounded-full border bg-background p-2 shadow-lg transition-all duration-300 ease-out hover:bg-muted",
            isAtBottom
              ? "pointer-events-none translate-y-8 opacity-0"
              : "translate-y-0 opacity-100"
          )}
          onClick={() => scrollToBottom("smooth")}
          type="button"
        >
          <ArrowDownIcon size={16} />
        </button>
      )}

      <PromptInput
        className="z-50 rounded-b-none rounded-tl-xl rounded-tr-xl border border-border/50 border-b-0 p-3 shadow-lg transition-all duration-200 focus-within:border-border hover:border-muted-foreground/50 focus:border-border"
        onSubmit={(event) => {
          event.preventDefault();
          if (status !== "ready") {
            toast.error("Please wait for the model to finish its response!");
          } else {
            submitForm();
          }
        }}
      >
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div
            className="flex flex-row items-end gap-2 overflow-x-scroll px-2"
            data-testid="attachments-preview"
          >
            {attachments.map((attachment) => (
              <PreviewAttachment
                attachment={attachment}
                key={attachment.url}
                onRemove={() => {
                  setAttachments((currentAttachments) =>
                    currentAttachments.filter((a) => a.url !== attachment.url)
                  );
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              />
            ))}

            {uploadQueue.map((filename) => (
              <PreviewAttachment
                attachment={{
                  url: "",
                  name: filename,
                  contentType: "",
                }}
                isUploading={true}
                key={filename}
              />
            ))}
          </div>
        )}
        <div className="flex flex-row items-start gap-1 sm:gap-2">
          <PromptInputTextarea
            autoFocus
            className="grow resize-none border-0! border-none! bg-transparent p-2 text-base leading-relaxed outline-none ring-0 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            data-testid="multimodal-input"
            disableAutoResize={true}
            maxHeight={300}
            minHeight={44}
            onChange={handleInput}
            placeholder="Send a message..."
            ref={textareaRef}
            rows={1}
            style={{ maxHeight: "300px", overflowY: "auto" }}
            value={input}
          />
          <Context {...contextProps} />
        </div>
        <PromptInputToolbar className="!border-top-0 border-t-0! pt-2 shadow-none dark:border-0 dark:border-transparent!">
          <PromptInputTools className="gap-0">
            <AttachmentsButton
              fileInputRef={fileInputRef}
              selectedModelId={selectedModelId}
              status={status}
            />
            <ModelSelectorCompact
              attachments={attachments}
              messages={messages}
              onModelChange={onModelChange}
              selectedModelId={selectedModelId}
            />
          </PromptInputTools>

          {status === "submitted" ? (
            <StopButton setMessages={setMessages} stop={stop} />
          ) : (
            <PromptInputSubmit
              className="size-8 rounded-full bg-primary text-primary-foreground transition-colors duration-200 hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
              data-testid="send-button"
              disabled={
                (!input.trim() && attachments.length === 0) ||
                uploadQueue.length > 0
              }
              status={status}
            >
              <ArrowUpIcon size={14} />
            </PromptInputSubmit>
          )}
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) {
      return false;
    }
    if (prevProps.status !== nextProps.status) {
      return false;
    }
    if (!equal(prevProps.attachments, nextProps.attachments)) {
      return false;
    }
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) {
      return false;
    }
    if (prevProps.selectedModelId !== nextProps.selectedModelId) {
      return false;
    }
    if (prevProps.isAtBottom !== nextProps.isAtBottom) {
      return false;
    }

    return true;
  }
);

function PureAttachmentsButton({
  fileInputRef,
  status,
  selectedModelId,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>["status"];
  selectedModelId: string;
}) {
  const isReasoningModel = selectedModelId === "chat-model-reasoning";

  return (
    <Button
      className="aspect-square h-8 rounded-lg p-1 transition-colors hover:bg-accent"
      data-testid="attachments-button"
      disabled={status !== "ready" || isReasoningModel}
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      variant="ghost"
    >
      <PaperclipIcon size={14} style={{ width: 14, height: 14 }} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

// If message exists we do not allow model selection
export function PureModelSelectorCompact({
  selectedModelId,
  onModelChange,
  messages,
  attachments = [],
}: {
  selectedModelId: string;
  onModelChange?: (modelId: string) => void;
  messages: UIMessage[];
  attachments?: Attachment[];
}) {
  const [optimisticModelId, setOptimisticModelId] = useState(selectedModelId);

  useEffect(() => {
    setOptimisticModelId(selectedModelId);
  }, [selectedModelId]);

  const selectedModel = chatModels.find(
    (model) => model.id === optimisticModelId
  );

  const hasMessages = messages.length > 0;

  return (
    <PromptInputModelSelect
      disabled={hasMessages}
      onValueChange={(modelId) => {
        if (hasMessages) {
          return; // Prevent model change if messages exist
        }

        const model = chatModels.find((m) => m.id === modelId);
        if (model) {
          setOptimisticModelId(model.id);
          onModelChange?.(model.id);
          startTransition(() => {
            saveChatModelAsCookie(model.id);
          });
        }
      }}
      value={selectedModel?.id}
    >
      <Trigger
        className={cn(
          "flex h-8 items-center gap-2 rounded-lg border-0 bg-background px-2 text-foreground shadow-none transition-colors focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          hasMessages ? "cursor-not-allowed opacity-50" : "hover:bg-accent"
        )}
        data-testid="model-selector-trigger"
        disabled={hasMessages}
        type="button"
      >
        <span className="hidden font-medium text-sm sm:block">
          {selectedModel?.name} {selectedModel?.model}
        </span>
        <ChevronDownIcon size={16} />
      </Trigger>
      <PromptInputModelSelectContent className="min-w-[260px] p-0">
        <div className="flex flex-col gap-px">
          {chatModels.map((model) => {
            const isCompatible = isModelCompatibleWithAttachments(
              model.id,
              attachments
            );
            const isDisabled = !isCompatible || hasMessages;

            return (
              <SelectItem disabled={isDisabled} key={model.id} value={model.id}>
                <div
                  className={cn(
                    "truncate font-medium text-xs",
                    isDisabled && "opacity-50"
                  )}
                >
                  {model.name} {model.model}
                </div>
                <div
                  className={cn(
                    "mt-px truncate text-[10px] text-muted-foreground leading-tight",
                    isDisabled && "opacity-50"
                  )}
                >
                  {!isCompatible && attachments.length > 0
                    ? "Not compatible with attached files"
                    : model.description}
                </div>
              </SelectItem>
            );
          })}
        </div>
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}

const ModelSelectorCompact = memo(PureModelSelectorCompact);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
}) {
  return (
    <Button
      className="size-7 rounded-full bg-foreground p-1 text-background transition-colors duration-200 hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground"
      data-testid="stop-button"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);
