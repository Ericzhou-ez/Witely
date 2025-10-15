import { NextResponse } from "next/server";
import z from "zod";
import { auth } from "@/app/(auth)/auth";
import { getUser, updateBioByUserId } from "@/lib/db/queries";

const bioSchema = z.object({
  bio: z.string().max(500),
});

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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", issues: error.errors },
        { status: 400 }
      );
    }
    console.error("Error posting user bio", error);
    return NextResponse.json(
      { error: "Failed to post user bio" },
      { status: 500 }
    );
  }
}
