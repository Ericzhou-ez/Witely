import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getAllPersonalizationsByUserId, getUser } from "@/lib/db/queries";

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

    const records = await getAllPersonalizationsByUserId({ userId: user.id });

    if (!records[0]) {
      return NextResponse.json(
        { error: "Personalization data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      personalization: {
        ...records[0].information,
        bio: records[0].bio,
      },
    });
  } catch (error) {
    console.error("Error getting personalizations", error);
    return NextResponse.json(
      { error: "Failed to get personalization" },
      { status: 500 }
    );
  }
}
