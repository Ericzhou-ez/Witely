import { z } from "zod";
import { ALL_MODEL_IDS } from "@/lib/ai/models";

const textPartSchema = z.object({
  type: z.enum(["text"]),
  text: z.string().min(1).max(100_000),
});

const filePartSchema = z.object({
  type: z.enum(["file"]),
  mediaType: z.enum([
    "image/jpeg",
    "image/png",
    "image/heic",
    "application/pdf",
    "text/plain",
    "text/csv",
    "text/markdown",
    "application/csv",
  ]),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    role: z.enum(["user"]),
    parts: z.array(partSchema).min(1, "Message must contain at least one part"),
  }),
  selectedChatModel: z.enum([...ALL_MODEL_IDS] as [string, ...string[]]),
  selectedVisibilityType: z.enum(["public", "private"]),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
export type FilePart = z.infer<typeof filePartSchema>;
