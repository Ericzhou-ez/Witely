import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUser } from "@/lib/db/queries";

/**
 * GET /api/user - Retrieve the current user's profile information.
 * 
 * This endpoint requires a valid session. It fetches the user data from the database
 * using the email from the session and returns a subset of user fields.
 * 
 * @returns {Promise<NextResponse>} 
 *   - 200: { id, email, name, profileURL, type }
 *   - 401: { error: "Unauthorized" } if no session or email
 *   - 404: { error: "User not found" } if user not in DB
 *   - 500: { error: "Failed to fetch user data" } on server error
 * 
 * @throws Any error during auth or DB query is caught and returns 500
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await getUser(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      profileURL: user.profileURL,
      type: user.type,
    });
  } catch (error) {
    console.error("Error in GET /api/user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
