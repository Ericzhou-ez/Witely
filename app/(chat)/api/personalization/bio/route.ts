import { NextResponse } from "next/server";
import z from "zod";
import { auth } from "@/app/(auth)/auth";
import { getUser, updateBioByUserId } from "@/lib/db/queries";

/**
 * Zod schema for validating the bio input.
 * The bio must be a non-empty string with a maximum length of 500 characters.
 */
const bioSchema = z.object({
  bio: z.string().max(500).min(1, "Bio cannot be empty"),
});

/**
 * POST API route handler to update the user's bio.
 * 
 * This endpoint authenticates the user, retrieves their profile,
 * validates the new bio input, and updates it in the database.
 * 
 * @param req - The Request object containing the JSON body with the new bio.
 * @returns {NextResponse} 
 *   - 200: { success: true } on successful update
 *   - 401: { error: "Unauthorized" } if no valid session
 *   - 404: { error: "User not found" } if user doesn't exist
 *   - 400: Zod validation error if bio is invalid
 *   - 500: { error: "Failed to post user bio" } on server error
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await getUser(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { bio } = bioSchema.parse(await req.json());

    await updateBioByUserId({ userId: user.id, bio });

    return NextResponse.json({ success: true });
  } catch (error) {
    // TODO: Improve error handling with specific error types (e.g., ZodError)
    console.error("Error posting user bio", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to post user bio" },
      { status: 500 }
    );
  }
}

/**
 * Suggested unit tests for this API route:
 * 
 * 1. Unauthorized access: Mock auth() to return null -> expect 401 response.
 * 2. User not found: Mock auth() with email, mock getUser() to return empty -> expect 404.
 * 3. Invalid bio (too long): Send bio >500 chars -> expect 400 with Zod errors.
 * 4. Invalid bio (empty): Send empty bio -> expect 400 with min length error.
 * 5. Successful update: Mock valid session, user, updateBioByUserId -> expect 200 {success: true}.
 * 6. Database error: Mock updateBioByUserId to throw -> expect 500.
 * 
 * Use Jest or Vitest with MSW for mocking auth, DB queries, and Request.
 * Ensure tests cover authentication flow and validation.
 */