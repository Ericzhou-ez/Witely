import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";

/**
 * Server-side page component for rendering a specific chat conversation.
 * Fetches the chat by ID, authenticates the user, retrieves messages, and renders the Chat component
 * with initial state. Handles private chat visibility and redirects unauthorized users.
 *
 * @param props - The page props containing dynamic route parameters.
 * @param {Promise<{ id: string }>} props.params - Resolves to the chat ID from the URL.
 * @returns {JSX.Element | never} The rendered chat interface, or calls notFound()/redirect() if invalid.
 */
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (chat.visibility === "private") {
    if (!session.user || session.user.id !== chat.userId) {
      notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({ id });
  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelCookie = cookieStore.get("chat-model");
  const hasModelCookie = !!chatModelCookie;

  // Determine initial model: use chat's last context if cookie is set, otherwise default
  const initialChatModel = hasModelCookie
    ? (chat.lastContext?.modelId ?? DEFAULT_CHAT_MODEL)
    : DEFAULT_CHAT_MODEL;

  const isReadonly = session?.user?.id !== chat.userId;

  return (
    <>
      <Chat
        autoResume={true}
        id={chat.id}
        initialChatModel={initialChatModel}
        initialLastContext={chat.lastContext ?? undefined}
        initialMessages={uiMessages}
        initialVisibilityType={chat.visibility}
        isReadonly={isReadonly}
      />
      <DataStreamHandler />
    </>
  );
}