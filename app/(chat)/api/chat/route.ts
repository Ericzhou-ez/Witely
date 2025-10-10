import { geolocation } from "@vercel/functions";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from "ai";
import { unstable_cache as cache } from "next/cache";
import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import type { ModelCatalog } from "tokenlens/core";
import { fetchModels } from "tokenlens/fetch";
import { getUsage } from "tokenlens/helpers";
import { auth, type UserType } from "@/app/(auth)/auth";
import type { VisibilityType } from "@/components/visibility-selector";
import { entitlementsByUserType } from "@/lib/ai/entitlements";
import {
  type FileAttachment,
  generateCompatibilityErrorMessage,
  validateFileCompatibility,
} from "@/lib/ai/file-compatibility";
import type { ChatModel } from "@/lib/ai/models";
import {
  analyzeAttachmentPrompt,
  type RequestHints,
  systemPrompt,
} from "@/lib/ai/prompts";
import { myProvider } from "@/lib/ai/providers";
import { createDocument } from "@/lib/ai/tools/create-document";
import { getWeather } from "@/lib/ai/tools/get-weather";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatLastContextById,
} from "@/lib/db/queries";
import { ChatSDKError } from "@/lib/errors";
import type { ChatMessage } from "@/lib/types";
import type { AppUsage } from "@/lib/usage";
import { convertToUIMessages, generateUUID } from "@/lib/utils";
import {
  generateTitleFromUserMessage,
  saveChatModelAsCookie,
} from "../../actions";
import {
  type FilePart,
  type PostRequestBody,
  postRequestBodySchema,
} from "./schema";

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

const getTokenlensCatalog = cache(
  async (): Promise<ModelCatalog | undefined> => {
    try {
      return await fetchModels();
    } catch (err) {
      console.warn(
        "TokenLens: catalog fetch failed, using default catalog",
        err
      );
      return; // tokenlens helpers will fall back to defaultCatalog
    }
  },
  ["tokenlens-catalog"],
  { revalidate: 24 * 60 * 60 } // 24 hours
);

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes("REDIS_URL")) {
        console.log(
          " > Resumable streams are disabled due to missing REDIS_URL"
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

/**
 * Fetches text file content from URL with timeout handling
 */
async function fetchTextFileContent(file: {
  name: string;
  url: string;
  mediaType: string;
}): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`Timeout for ${file.name}`);
      controller.abort();
    }, 30_000);

    const response = await fetch(file.url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed: ${response.status}`);
      return `\n\n[File Upload: ${file.name} (${file.mediaType}) - Failed: ${response.status}]`;
    }

    const content = await response.text();

    // Check if content is too large (max 0.5MB for text files)
    const maxSize = 0.5 * 1024 * 1024;
    if (content.length > maxSize) {
      return `\n\n[File Upload: ${file.name} (${file.mediaType}) - File too large (${Math.round(content.length / 1024)}KB)]`;
    }

    return `\n\n[File Upload: ${file.name} (${file.mediaType})]\n${content}`;
  } catch (error) {
    console.error(`Error fetching ${file.name}:`, error);
    return `\n\n[File Upload: ${file.name} (${file.mediaType}) - Failed to load]`;
  }
}

/**
 * Processes UI messages to extract text files and convert them to text parts
 * Text files (txt, csv, md) are removed from file parts and their content is appended as text
 */
async function processUIMessagesWithTextFiles(
  uiMessages: ChatMessage[]
): Promise<ChatMessage[]> {
  const fileCache = new Map<string, Promise<string>>();

return await Promise.all(
    uiMessages.map(async (msg) => {
      if (msg.role !== "user" || !msg.parts) {
        return msg;
      }

      type FilePartWithUrl = {
        type: "file";
        name: string;
        url: string;
        mediaType: string;
      };

      const textFiles: FilePartWithUrl[] = [];
      const nonTextParts: ChatMessage["parts"] = [];

      // Separate text files from other parts
      for (const part of msg.parts) {
        if (part.type === "file") {
          const filePart = part as FilePartWithUrl;
          const mediaType = filePart.mediaType;
          const isTextFile =
            mediaType === "text/plain" ||
            mediaType === "text/csv" ||
            mediaType === "text/markdown" ||
            mediaType === "application/csv";

          if (isTextFile) {
            textFiles.push(filePart);
          } else {
            // Keep images and PDFs as file parts
            nonTextParts.push(part);
          }
        } else {
          // Keep all non-file parts (text, tool calls, etc.)
          nonTextParts.push(part);
        }
      }

      // Fetch text file contents and append to message
      if (textFiles.length > 0) {
        const textFileContents = await Promise.all(
          textFiles.map((file) => {
            const key = file.url;
            if (!fileCache.has(key)) {
              fileCache.set(key, fetchTextFileContent(file));
            }
            return fileCache.get(key);
          })
        );

        const appendedText = textFileContents.join("");

        // Find existing text part or create new one
        const textPartIndex = nonTextParts.findIndex((p) => p.type === "text");
        if (textPartIndex >= 0) {
          const existingPart = nonTextParts[textPartIndex];
          if (existingPart.type === "text") {
            nonTextParts[textPartIndex] = {
              ...existingPart,
              text: existingPart.text + appendedText,
            };
          }
        } else {
          nonTextParts.push({
            type: "text",
            text: appendedText.trim(),
          });
        }
      }

      return {
        ...msg,
        parts: nonTextParts,
      };
    })
  );
}

/**
 * Converts processed UI messages to model messages and applies Gateway AI format for images
 * Images get converted to { type: "file", data: URL, filename, mediaType }
 * PDFs and other files stay in standard format
 */
function convertToGatewayModelMessages(
  processedUIMessages: ChatMessage[]
): Awaited<ReturnType<typeof convertToModelMessages>> {
  const modelMessages = convertToModelMessages(processedUIMessages);

  return modelMessages.map((msg) => {
    if (msg.role === "user" && msg.content && Array.isArray(msg.content)) {
      return {
        ...msg,
        content: msg.content.map((part) => {
          // Convert image files to Gateway AI format
          if (
            part.type === "file" &&
            typeof part === "object" &&
            "url" in part &&
            part.url
          ) {
            const filePart = part as {
              type: "file";
              url: string;
              name?: string;
              mimeType?: string;
              mediaType?: string;
            };
            const mediaType = filePart.mimeType || filePart.mediaType;
            if (mediaType?.startsWith("image/")) {
              return {
                type: "file" as const,
                data: filePart.url,
                filename: filePart.name,
                mediaType,
              };
            }
          }
          return part;
        }),
      };
    }
    return msg;
  });
}

/**
 * Handles the creation of a new chat message.
 * Validates input, processes files, checks entitlements, saves messages,
 * and streams the AI response using the selected model.
 *
 * @param {Request} request - The HTTP request containing the chat data in JSON body.
 * @returns {Promise&lt;Response&gt;} A streaming Response with SSE events or an error Response.
 */
export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel["id"];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError("unauthorized:chat").toResponse();
    }

    const userType: UserType = session.user.type;

    // Update chat model cookie with the current model ID
    await saveChatModelAsCookie(selectedChatModel);

    // Validate file compatibility with selected model
    const fileParts = message.parts.filter(
      (part): part is FilePart => part.type === "file"
    );

    if (fileParts.length > 0) {
      const fileAttachments: FileAttachment[] = fileParts.map((part) => ({
        name: part.name,
        url: part.url,
        mediaType: part.mediaType as FileAttachment["mediaType"],
      }));

      const incompatibleFiles = validateFileCompatibility(
        fileAttachments,
        selectedChatModel
      );

      if (incompatibleFiles.length > 0) {
        const errorMessage =
          generateCompatibilityErrorMessage(incompatibleFiles);
        return Response.json(
          {
            error: errorMessage,
            incompatibleFiles,
          },
          { status: 400 }
        );
      }
    }

    // TODO: credit based limit per month
    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError("rate_limit:chat").toResponse();
    }

    const chat = await getChatById({ id });

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError("forbidden:chat").toResponse();
      }
    } else {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
      });
    }

    const messagesFromDb = await getMessagesByChatId({ id });

    const hasTextPart = message.parts.some((part) => part.type === "text");
    const hasFilePart = message.parts.some((part) => part.type === "file");

    const messageForModel =
      !hasTextPart && hasFilePart
        ? {
            ...message,
            parts: [
              ...message.parts,
              {
                type: "text" as const,
                text: analyzeAttachmentPrompt,
              },
            ],
          }
        : message;

    const uiMessages = [
      ...convertToUIMessages(messagesFromDb),
      messageForModel,
    ];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts, // Save original message without injected prompt
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    let finalMergedUsage: AppUsage | undefined;

    // Process text files
    let processedUIMessages: ChatMessage[];
    try {
      processedUIMessages = await processUIMessagesWithTextFiles(uiMessages);
    } catch (error) {
      console.error("Error processing text files:", error);
      processedUIMessages = uiMessages;
    }

    // Convert to model messages with Gateway AI format for images
    let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>;
    try {
      modelMessages = convertToGatewayModelMessages(processedUIMessages);
    } catch (error) {
      console.error("Error converting model messages:", error);
      modelMessages = convertToModelMessages(processedUIMessages);
    }

    // Create and execute the stream
    const stream = createUIMessageStream({
      execute: ({ writer: dataStream }) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel, requestHints }),
          messages: modelMessages,
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            selectedChatModel === "chat-model-reasoning"
              ? []
              : [
                  "getWeather",
                  "createDocument",
                  "updateDocument",
                  "requestSuggestions",
                ],
          experimental_transform: smoothStream({ chunking: "word" }),
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: "stream-text",
          },
          onFinish: async ({ usage }) => {
            try {
              const providers = await getTokenlensCatalog();
              const modelId =
                myProvider.languageModel(selectedChatModel).modelId;
              if (!modelId) {
                finalMergedUsage = usage;
                dataStream.write({
                  type: "data-usage",
                  data: finalMergedUsage,
                });
                return;
              }

              if (!providers) {
                finalMergedUsage = usage;
                dataStream.write({
                  type: "data-usage",
                  data: finalMergedUsage,
                });
                return;
              }

              const summary = getUsage({ modelId, usage, providers });
              finalMergedUsage = { ...usage, ...summary, modelId } as AppUsage;
              dataStream.write({ type: "data-usage", data: finalMergedUsage });
            } catch (err) {
              console.warn("TokenLens enrichment failed", err);
              finalMergedUsage = usage;
              dataStream.write({ type: "data-usage", data: finalMergedUsage });
            }
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          })
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        await saveMessages({
          messages: messages.map((currentMessage) => ({
            id: currentMessage.id,
            role: currentMessage.role,
            parts: currentMessage.parts,
            createdAt: new Date(),
            attachments: [],
            chatId: id,
          })),
        });

        if (finalMergedUsage) {
          try {
            await updateChatLastContextById({
              chatId: id,
              context: finalMergedUsage,
            });
          } catch (err) {
            console.warn("Unable to persist last usage for chat", id, err);
          }
        }
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream())
        )
      );
    }

    return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
  } catch (error) {
    const vercelId = request.headers.get("x-vercel-id");

    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    // Check for Vercel AI Gateway credit card error
    if (
      error instanceof Error &&
      error.message?.includes(
        "AI Gateway requires a valid credit card on file to service requests"
      )
    ) {
      return new ChatSDKError("bad_request:activate_gateway").toResponse();
    }

    console.error("Unhandled error in chat API:", error, { vercelId });
    return new ChatSDKError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatSDKError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatSDKError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
