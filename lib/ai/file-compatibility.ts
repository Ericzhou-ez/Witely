import type { ChatModel } from "./models";
import { chatModels } from "./models";

export type MediaType =
  | "image/jpeg"
  | "image/png"
  | "image/heic"
  | "application/pdf"
  | "text/plain"
  | "text/csv"
  | "text/markdown"
  | "application/csv";

export type FileAttachment = {
  name: string;
  url: string;
  mediaType: MediaType;
};

export type FileCompatibilityError = {
  fileName: string;
  mediaType: MediaType;
  reason: string;
  modelName: string;
};

/**
 * Checks if a specific media type is compatible with a given model
 */
export function isMediaTypeCompatible(
  mediaType: MediaType,
  model: ChatModel
): boolean {
  // Image types - require vision capability
  if (
    mediaType === "image/jpeg" ||
    mediaType === "image/png" ||
    mediaType === "image/heic"
  ) {
    return model.vision;
  }

  // PDF files - require pdf_understanding capability
  if (mediaType === "application/pdf") {
    return model.pdf_understanding;
  }

  // Text files - all models can handle text
  if (
    mediaType === "text/plain" ||
    mediaType === "text/csv" ||
    mediaType === "text/markdown" ||
    mediaType === "application/csv"
  ) {
    return true;
  }

  return false;
}

/**
 * Validates if all file attachments are compatible with the selected model
 * Returns an array of incompatible files with error details
 */
export function validateFileCompatibility(
  files: FileAttachment[],
  modelId: string
): FileCompatibilityError[] {
  const model = chatModels.find((m) => m.id === modelId);

  if (!model) {
    return files.map((file) => ({
      fileName: file.name,
      mediaType: file.mediaType,
      reason: "Model not found",
      modelName: "Unknown",
    }));
  }

  const incompatibleFiles: FileCompatibilityError[] = [];

  for (const file of files) {
    if (!isMediaTypeCompatible(file.mediaType, model)) {
      let reason = "";

      if (
        file.mediaType === "image/jpeg" ||
        file.mediaType === "image/png" ||
        file.mediaType === "image/heic"
      ) {
        reason = "This model does not support image files";
      } else if (file.mediaType === "application/pdf") {
        reason = "This model does not support PDF files";
      } else {
        reason = "This file type is not supported by this model";
      }

      incompatibleFiles.push({
        fileName: file.name,
        mediaType: file.mediaType,
        reason,
        modelName: `${model.name} ${model.model}${model.model_detail ? ` ${model.model_detail}` : ""}`,
      });
    }
  }

  return incompatibleFiles;
}

/**
 * Generates a user-friendly error message for incompatible files
 */
export function generateCompatibilityErrorMessage(
  errors: FileCompatibilityError[]
): string {
  if (errors.length === 0) {
    return "";
  }

  if (errors.length === 1) {
    const error = errors[0];
    return `"${error.fileName}" is not compatible with ${error.modelName}. ${error.reason}.`;
  }

  const fileNames = errors.map((e) => `"${e.fileName}"`).join(", ");
  const modelName = errors[0].modelName;
  return `The following files are not compatible with ${modelName}: ${fileNames}. Please select a different model or remove these files.`;
}

/**
 * Gets the list of supported file types for a given model
 */
export function getSupportedFileTypes(modelId: string): {
  extensions: string[];
  description: string;
} {
  const model = chatModels.find((m) => m.id === modelId);

  if (!model) {
    return { extensions: ["TXT", "CSV", "MD"], description: "Text files only" };
  }

  const supported: string[] = [];

  // Text files are always supported
  supported.push("TXT", "CSV", "MD");

  // Add image formats if model has vision
  if (model.vision) {
    supported.push("JPG", "PNG", "HEIC");
  }

  // Add PDF if model supports it
  if (model.pdf_understanding) {
    supported.push("PDF");
  }

  const description = [
    model.vision && "Images",
    model.pdf_understanding && "PDFs",
    "Text files",
  ]
    .filter(Boolean)
    .join(", ");

  return { extensions: supported, description };
}

/**
 * Checks if a model is compatible with all given attachments
 */
export function isModelCompatibleWithAttachments(
  modelId: string,
  attachments: Array<{ contentType: string }>
): boolean {
  if (attachments.length === 0) {
    return true;
  }

  const model = chatModels.find((m) => m.id === modelId);
  if (!model) {
    return false;
  }

  return attachments.every((attachment) => {
    const mediaType = attachment.contentType as MediaType;
    return isMediaTypeCompatible(mediaType, model);
  });
}

/**
 * Gets the list of models that are compatible with given attachments
 */
export function getCompatibleModels(
  attachments: Array<{ contentType: string }>,
  availableModels: ChatModel[]
): ChatModel[] {
  if (attachments.length === 0) {
    return availableModels;
  }

  return availableModels.filter((model) =>
    attachments.every((attachment) => {
      const mediaType = attachment.contentType as MediaType;
      return isMediaTypeCompatible(mediaType, model);
    })
  );
}

export const getMediaTypeFromFile = (file: File): string => {
  const type = file.type.toLowerCase();
  if (type === "image/jpeg" || type === "image/jpg") {
    return "image/jpeg";
  }
  if (type === "image/png") {
    return "image/png";
  }
  if (type === "image/heic") {
    return "image/heic";
  }
  if (type === "application/pdf") {
    return "application/pdf";
  }
  if (type === "text/plain") {
    return "text/plain";
  }
  if (type === "text/csv" || type === "application/csv") {
    return "text/csv";
  }
  if (type === "text/markdown") {
    return "text/markdown";
  }
  return type;
};
