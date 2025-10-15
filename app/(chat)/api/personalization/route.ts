import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getAllPersonalizationsByUserId, getUser } from "@/lib/db/queries";

interface PersonalizationData {
  success: true;
  personalization: {
    bio: string;
    [key: string]: any;
  };
}

/**
 * Retrieves the user's personalization data from the database.
 * 
 * @param email - The user's email address.
 * @returns The personalization data including bio and other information.
 * @throws Error if user not found or personalization data not found.
 */
async function getPersonalizationData(email: string): Promise<PersonalizationData> {
  const [user] = await getUser(email);
  if (!user) {
    throw new Error("User not found");
  }
  const records = await getAllPersonalizationsByUserId({ userId: user.id });
  if (!records[0]) {
    throw new Error("Personalization data not found");
  }
  return {
    success: true,
    personalization: {
      ...records[0].information,
      bio: records[0].bio,
    },
  };
}

/**
 * GET handler for the personalization API route.
 * Authenticates the user and fetches their personalization data.
 * 
 * @returns NextResponse with JSON containing success and personalization data,
 * or error response with appropriate status code.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await getPersonalizationData(session.user.email);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting personalizations", error);
    let status = 500;
    let errorMsg = "Failed to get personalization";
    if (error instanceof Error) {
      if (error.message === "User not found") {
        status = 404;
        errorMsg = "User not found";
      } else if (error.message === "Personalization data not found") {
        status = 404;
        errorMsg = "Personalization data not found";
      }
    }
    return NextResponse.json(
      { error: errorMsg },
      { status }
    );
  }
}