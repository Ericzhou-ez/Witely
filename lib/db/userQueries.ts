import "server-only";

import { eq } from "drizzle-orm";
import { ChatSDKError } from "../errors";
import type { UserType } from "@/app/(auth)/auth";
import { user } from "./schema";
import { db } from "./db";
import { generateHashedPassword } from "./utils";

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser({
  email,
  password,
  name,
  profileURL,
  type,
}: {
  email: string;
  password: string | null;
  name: string;
  profileURL?: string | null;
  type?: UserType;
}) {
  const hashedPassword = generateHashedPassword(password);

  try {
    const [newUser] = await db
      .insert(user)
      .values({ email, password: hashedPassword, name, profileURL, type })
      .returning();
    return newUser;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}
