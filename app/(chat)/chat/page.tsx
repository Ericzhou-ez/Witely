import { cookies } from "next/headers";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";

/**
 * Retrieves the initial chat model ID from cookies or defaults to the predefined model.
 * This function is server-side only and handles cookie access asynchronously.
 * @returns {Promise<string>} The model ID string to use for initializing the chat.
 */
async function getInitialChatModel(): Promise<string> {
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("chat-model");
  return modelIdFromCookie?.value ?? DEFAULT_CHAT_MODEL;
}

/**
 * The main chat page component for the Witely application.
 * This server component generates a unique session ID and determines the initial chat model
 * based on user cookie preferences or defaults to the application's standard model.
 * It renders the Chat component with empty initial messages for a new conversation
 * and includes the DataStreamHandler for real-time updates.
 * 
 * This component is designed to be server-rendered, ensuring secure cookie access
 * without client-side exposure. For testing, use data-testid="chat-page" to locate
 * the rendered Chat component in e2e tests.
 * 
 * @returns {Promise<JSX.Element>} The JSX for the chat page.
 */
export default async function Page(): Promise<JSX.Element> {
  const id = generateUUID();
  const initialModel = await getInitialChatModel();

  return (
    <>
      <Chat
        autoResume={false}
        id={id}
        initialChatModel={initialModel}
        initialMessages={[]}
        initialVisibilityType="private"
        isReadonly={false}
        key={id}
        data-testid="chat-page"
      />
      <DataStreamHandler />
    </>
  );
}
