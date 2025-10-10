import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";

/**
 * Supported file types and their maximum sizes in bytes.
 * Labels are for user-friendly display.
 */
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

/**
 * Sanitizes a filename to prevent path traversal and invalid characters.
 * Replaces invalid characters with underscores, limits length to 100 chars,
 * preserving extension if possible.
 * @param filename - Original filename
 * @returns Sanitized filename
 */
function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'unnamed_file';
  }

  // Remove path components
  const basename = filename.split(/[\\/]/).pop() || filename;

  // Replace invalid filename characters (Windows + others)
  let sanitized = basename.replace(/[<>:"/\\|?*]/g, '_');

  // Replace other special characters
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Remove leading and trailing underscores/dots
  sanitized = sanitized.replace(/^[_.-]+|[_.-]+$/g, '');

  // Limit length, preserving extension
  if (sanitized.length > 100) {
    const dotIndex = sanitized.lastIndexOf('.');
    if (dotIndex > 0 && dotIndex < 90) {  // Ensure extension is preserved
      const namePart = sanitized.substring(0, 100 - (sanitized.length - dotIndex));
      sanitized = namePart + sanitized.substring(dotIndex);
    } else {
      sanitized = sanitized.substring(0, 100);
    }
  }

  if (!sanitized) {
    sanitized = 'unnamed_file';
  }

  return sanitized;
}

/**
 * Validates the uploaded file against supported types and size limits.
 * @param file - The Blob file to validate
 * @returns Validation result
 */
function validateFile(file: Blob): z.SafeParseReturnType<typeof FileSchema> {
  return FileSchema.safeParse({ file });
}

/**
 * Handles file upload for chat attachments.
 * Authenticates the user, validates the file, sanitizes the name,
 * and uploads to Vercel Blob.
 * @param request - The incoming multipart form request with 'file' field
 * @returns NextResponse with JSON { url, ... } on success, or error
 */
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!request.body) {
    return NextResponse.json(
      { error: "Request body is empty" },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();
    const fileBlob = formData.get("file") as Blob;

    if (!fileBlob || fileBlob.size === 0) {
      return NextResponse.json({ error: "No valid file uploaded" }, { status: 400 });
    }

    // Get filename; fallback if not available
    let filename = 'unnamed_file';
    const fileEntry = formData.get("file");
    if (fileEntry instanceof File) {
      filename = fileEntry.name;
    } else if (typeof fileEntry === 'string') {
      filename = fileEntry;
    }

    const validated = validateFile(fileBlob);

    if (!validated.success) {
      const errorMessage = validated.error.errors
        .map((err) => err.message)
        .join(", ");
      console.error("File validation error:", {
        userId: session.user.id,
        filename,
        errors: validated.error.errors,
      });
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const sanitizedFilename = sanitizeFilename(filename);

    if (!sanitizedFilename) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    const fileBuffer = await fileBlob.arrayBuffer();

    const blobPath = `${session.user.id}/${Date.now()}-${sanitizedFilename}`;

    try {
      const data = await put(blobPath, fileBuffer, {
        access: "public",
      });

      console.log("File uploaded successfully:", {
        userId: session.user.id,
        filename: sanitizedFilename,
        url: data.url,
      });

      return NextResponse.json(data);
    } catch (uploadError) {
      console.error("Blob upload error:", {
        userId: session.user.id,
        filename: sanitizedFilename,
        error: uploadError instanceof Error ? uploadError.message : 'Unknown upload error',
      });
      return NextResponse.json(
        {
          error: "Upload failed due to server error",
        },
        { status: 500 }
      );
    }
  } catch (processError) {
    console.error("Request processing error:", {
      userId: session?.user?.id,
      error: processError instanceof Error ? processError.message : 'Unknown processing error',
    });
    return NextResponse.json(
      {
        error: "Failed to process request",
      },
      { status: 500 }
    );
  }
}
