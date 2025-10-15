import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  json,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { AppUsage } from "../usage";
import type { PersonalInformation } from "./types";

/**
 * Enum for user subscription types.
 * Defines the possible tiers for user accounts.
 */
export const userTypeEnum = pgEnum("user_type_enum", [
  "plus",
  "pro",
  "ultra",
  "dev",
  "free",
]);

/**
 * User table: Stores core user information including authentication and profile details.
 * 
 * @remarks
 * - Primary key: id (UUID)
 * - References: None (root entity)
 * - Used in: Personalization, Chat, Document, Suggestion, Stream
 */
export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  profileURL: varchar("profile_url", { length: 256 }),
  password: varchar("password", { length: 64 }),
  type: userTypeEnum("type").default("free").notNull(),
});

export type User = InferSelectModel<typeof user>;
export type UserInsert = InferInsertModel<typeof user>;

/**
 * Chat table: Represents conversation sessions between users and AI.
 * 
 * @remarks
 * - Primary key: id (UUID)
 * - Foreign keys: userId -> User.id
 * - Used in: Message, Vote, Stream
 * - lastContext: Stores the last app usage state as JSONB for resuming chats
 */
export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  title: text("title").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  visibility: varchar("visibility", { enum: ["public", "private"] })
    .notNull()
    .default("private"),
  lastContext: jsonb("lastContext").$type<AppUsage | null>(),
});

export type Chat = InferSelectModel<typeof chat>;
export type ChatInsert = InferInsertModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
/**
 * Deprecated Message table: Legacy structure for chat messages.
 * 
 * @deprecated Use Message_v2 instead. See migration guide.
 * @remarks
 * - Primary key: id (UUID)
 * - Foreign keys: chatId -> Chat.id
 */
export const messageDeprecated = pgTable("Message", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;
export type MessageDeprecatedInsert = InferInsertModel<typeof messageDeprecated>;

/**
 * Message table (v2): Stores individual messages in chats with structured parts and attachments.
 * 
 * @remarks
 * - Primary key: id (UUID)
 * - Foreign keys: chatId -> Chat.id
 * - parts: Array of message components (text, code, etc.)
 * - attachments: Associated files or media
 * - Replaces deprecated Message table
 */
export const message = pgTable("Message_v2", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("createdAt").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;
export type DBMessageInsert = InferInsertModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
/**
 * Deprecated Vote table: Legacy voting on messages.
 * 
 * @deprecated Use Vote_v2 instead. See migration guide.
 * @remarks
 * - Composite primary key: (chatId, messageId)
 * - Foreign keys: chatId -> Chat.id, messageId -> Message.id (deprecated)
 */
export const voteDeprecated = pgTable(
  "Vote",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;
export type VoteDeprecatedInsert = InferInsertModel<typeof voteDeprecated>;

/**
 * Vote table (v2): User votes (up/down) on messages in chats.
 * 
 * @remarks
 * - Composite primary key: (chatId, messageId)
 * - Foreign keys: chatId -> Chat.id, messageId -> Message_v2.id
 * - Replaces deprecated Vote table
 */
export const vote = pgTable(
  "Vote_v2",
  {
    chatId: uuid("chatId")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  }
);

export type Vote = InferSelectModel<typeof vote>;
export type VoteInsert = InferInsertModel<typeof vote>;

/**
 * Document table: User-created documents for editing and suggestions.
 * 
 * @remarks
 * - Composite primary key: (id, createdAt)
 * - Foreign keys: userId -> User.id
 * - kind: Type of document (text, code, image, sheet)
 * - Used in: Suggestion
 */
export const document = pgTable(
  "Document",
  {
    id: uuid("id").notNull().defaultRandom(),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    kind: varchar("text", { enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  }
);

export type Document = InferSelectModel<typeof document>;
export type DocumentInsert = InferInsertModel<typeof document>;

/**
 * Suggestion table: AI-generated suggestions for document improvements.
 * 
 * @remarks
 * - Primary key: id (UUID)
 * - Foreign keys: userId -> User.id, composite (documentId, documentCreatedAt) -> (Document.id, Document.createdAt)
 * - isResolved: Flag for whether the suggestion has been applied
 */
export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id").notNull().defaultRandom(),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  })
);

export type Suggestion = InferSelectModel<typeof suggestion>;
export type SuggestionInsert = InferInsertModel<typeof suggestion>;

/**
 * Stream table: Represents streaming sessions within chats.
 * 
 * @remarks
 * - Primary key: id (UUID)
 * - Foreign keys: chatId -> Chat.id
 */
export const stream = pgTable(
  "Stream",
  {
    id: uuid("id").notNull().defaultRandom(),
    chatId: uuid("chatId").notNull(),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  })
);

export type Stream = InferSelectModel<typeof stream>;
export type StreamInsert = InferInsertModel<typeof stream>;

/**
 * Personalization table: Stores user-specific personalization data like bio and information.
 * 
 * @remarks
 * - Primary key: id (UUID)
 * - Foreign keys: userId -> User.id
 * - information: JSON field typed as PersonalInformation
 * - bio: Short user bio
 */
export const personalization = pgTable("Personalization", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
  information: json("information").$type<PersonalInformation>(),
  bio: varchar("bio", { length: 500 }),
});

export type Personalization = InferSelectModel<typeof personalization>;
export type PersonalizationInsert = InferInsertModel<typeof personalization>;
