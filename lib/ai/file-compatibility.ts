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
 * Checks if a specific media type is compatible with a given model.
 *
 * This function determines compatibility based on the model's capabilities:
 * - Images (JPEG, PNG, HEIC) require vision capability.
 * - PDFs require PDF understanding capability.
 * - Text files (plain, CSV, Markdown) are supported by all models.
 *
 * @param mediaType - The MIME type of the file to check.
 * @param model - The ChatModel instance to verify against.
 * @returns `true` if the media type is compatible with the model, `false` otherwise.
 *
 * @example
 * import { chatModels } from './models';
 * const gpt4oModel = chatModels.find(m => m.id === 'gpt-4o');
 * const isCompatible = isMediaTypeCompatible('image/jpeg', gpt4oModel!);
 * // Returns true, since GPT-4o has vision capability
 *
 * @example
 * const textCompatible = isMediaTypeCompatible('text/plain', gpt4oModel!);
 * // Returns true, as all models support text
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
 * Validates if all file attachments are compatible with the selected model.
 *
 * Iterates through the provided files and checks each against the model's capabilities.
 * Returns a list of errors for incompatible files, including details on why they are incompatible.
 *
 * @param files - Array of FileAttachment objects to validate.
 * @param modelId - The ID of the model to check compatibility against.
 * @returns An array of FileCompatibilityError objects for incompatible files. Empty array if all are compatible.
 *
 * @example
 * const files = [
 *   { name: 'image.jpg', url: 'url1', mediaType: 'image/jpeg' },
 *   { name: 'doc.txt', url: 'url2', mediaType: 'text/plain' }
 * ];
 * const errors = validateFileCompatibility(files, 'gpt-4o');
 * // Returns [] if GPT-4o supports images, or error for image if not
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
 * Generates a user-friendly error message for incompatible files.
 *
 * Creates a readable message explaining which files are incompatible and why,
 * suitable for displaying to users in the UI.
 *
 * @param errors - Array of FileCompatibilityError objects.
 * @returns A string message describing the incompatibilities. Empty string if no errors.
 *
 * @example
 * const errors = [{ fileName: 'image.jpg', mediaType: 'image/jpeg', reason: 'No vision', modelName: 'GPT-3.5' }];
 * const message = generateCompatibilityErrorMessage(errors);
 * // Returns: '"image.jpg" is not compatible with GPT-3.5. This model does not support image files.'
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
 * Gets the list of supported file types for a given model.
 *
 * Returns file extensions and a description of supported formats based on the model's capabilities.
 *
 * @param modelId - The ID of the model to query.
 * @returns An object with `extensions` (array of uppercase extensions) and `description` (string).
 *
 * @example
 * const supported = getSupportedFileTypes('gpt-4o');
 * // Returns { extensions: ['TXT', 'CSV', 'MD', 'JPG', 'PNG', 'HEIC', 'PDF'], description: 'Images, PDFs, Text files' }
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
 * Checks if a model is compatible with all given attachments.
 *
 * Quick check to see if all attachments' content types are supported by the model.
 *
 * @param modelId - The ID of the model.
 * @param attachments - Array of objects with contentType property.
 * @returns `true` if all attachments are compatible, `false` otherwise.
 *
 * @example
 * const attachments = [{ contentType: 'text/plain' }, { contentType: 'image/jpeg' }];
 * const compatible = isModelCompatibleWithAttachments('gpt-4o', attachments);
 * // true if model supports both
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
 * Gets the list of models that are compatible with given attachments.
 *
 * Filters the available models to those that support all provided attachments.
 *
 * @param attachments - Array of attachment objects with contentType.
 * @param availableModels - List of ChatModel to filter from.
 * @returns Filtered array of compatible ChatModel instances.
 *
 * @example
 * const attachments = [{ contentType: 'application/pdf' }];
 * const compatibleModels = getCompatibleModels(attachments, chatModels);
 * // Returns models that have pdf_understanding: true
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

/**
 * Normalizes the MIME type from a File object to a standard MediaType.
 *
 * Handles common variations like 'image/jpg' to 'image/jpeg', and CSV types.
 *
 * @param file - The File object to extract type from.
 * @returns A normalized MediaType string, or the original type if unknown.
 *
 * @example
 * const file = new File(['content'], 'test.jpg', { type: 'image/jpg' });
 * const mediaType = getMediaTypeFromFile(file);
 * // Returns 'image/jpeg'
 */
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
