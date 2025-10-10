import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

const SUPPORTED_FILE_TYPES = {
  // Images
  "image/jpeg": { maxSize: 5 * 1024 * 1024, label: "JPEG" },
  "image/png": { maxSize: 5 * 1024 * 1024, label: "PNG" },
  "image/heic": { maxSize: 5 * 1024 * 1024, label: "HEIC" },
  // Documents
  "application/pdf": { maxSize: 10 * 1024 * 1024, label: "PDF" },
  // Text files
  "text/plain": { maxSize: 5 * 1024 * 1024, label: "Text" },
  "text/csv": { maxSize: 5 * 1024 * 1024, label: "CSV" },
  "text/markdown": { maxSize: 5 * 1024 * 1024, label: "Markdown" },
  // CSV is also application/csv
  "application/csv": { maxSize: 5 * 1024 * 1024, label: "CSV" },
};

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z.instanceof(Blob).refine(
    (file) => {
      const fileType = file.type as keyof typeof SUPPORTED_FILE_TYPES;
      if (!SUPPORTED_FILE_TYPES[fileType]) {
        return false;
      }
      const maxSize = SUPPORTED_FILE_TYPES[fileType].maxSize;
      return file.size <= maxSize;
    },
    (file) => {
      const fileType = file.type as keyof typeof SUPPORTED_FILE_TYPES;
      if (!SUPPORTED_FILE_TYPES[fileType]) {
        const supportedTypes = Object.values(SUPPORTED_FILE_TYPES)
          .map((t) => t.label)
          .join(", ");
        return {
          message: `Unsupported file type. Supported formats: ${supportedTypes}`,
        };
      }
      const maxSize = SUPPORTED_FILE_TYPES[fileType].maxSize;
      const maxSizeMB = maxSize / (1024 * 1024);
      return {
        message: `File size should be less than ${maxSizeMB}MB for ${SUPPORTED_FILE_TYPES[fileType].label} files`,
      };
    }
  ),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get("file") as File).name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const data = await put(`${filename}`, fileBuffer, {
        access: "public",
      });

      return NextResponse.json(data);
    } catch (_error) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
