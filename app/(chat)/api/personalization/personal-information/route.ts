import { NextResponse } from "next/server";
import z from "zod";
import { auth } from "@/app/(auth)/auth";
import {
  getAllPersonalizationsByUserId,
  getUser,
  updatePersonalInformationByUserId,
} from "@/lib/db/queries";
import type { PersonalInformation } from "@/lib/db/types";

const updatesSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().max(256).optional(),
  phone: z.string().max(20).optional(),
  addressLine1: z.string().max(100).optional(),
  addressLine2: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  gender: z
    .enum(["Male", "Female", "Non-binary", "Prefer not to say", "Other"])
    .optional(),
});

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await getUser(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates = updatesSchema.parse(await req.json());

    const records = await getAllPersonalizationsByUserId({ userId: user.id });
    const existingData = records[0]?.information;

    const merged = {
      ...(existingData || {}),
      ...updates,
    } as PersonalInformation;

    await updatePersonalInformationByUserId({
      userId: user.id,
      personalInformation: merged,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", issues: error.errors },
        { status: 400 }
      );
    }

    console.error("Error patching personal information", error);
    return NextResponse.json(
      { error: "Failed to patch personal information" },
      { status: 500 }
    );
  }
}
