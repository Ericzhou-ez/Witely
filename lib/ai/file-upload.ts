import { toast } from "sonner";
import type { Attachment } from "../types";
import {
  getMediaTypeFromFile,
  isMediaTypeCompatible,
  type MediaType,
} from "./file-compatibility";
import type { ChatModel } from "./models";

/**
 * File upload utilities for handling attachments in chat messages.
 * 
 * This module provides functions to validate files against model compatibility,
 * size limits, and attachment counts before uploading them to the server.
 * It integrates with the file compatibility checker and handles upload errors gracefully.
 * 
 * @module file-upload
 * @example
 * // Example usage in a component
 * const attachments = await validateAndUploadFiles(selectedFiles, currentModel, existingAttachments.length);
 * if (attachments.length > 0) {
 *   // Add to message
 * }
 */

/**
 * Maximum number of attachments allowed per message.
 * @constant {number}
 */
export const MAX_ATTACHMENTS = 8;

/**
 * Maximum total size of all attachments in bytes (50MB).
 * @constant {number}
 */
export const MAX_TOTAL_ATTACHMENT_SIZE = 50 * 1024 * 1024;

/**
 * Validates files for compatibility with the selected model, checks limits,
 * and uploads compatible files to the server.
 * 
 * @param {File[]} files - Array of files to validate and upload.
 * @param {ChatModel} selectedModel - The currently selected chat model to check compatibility against.
 * @param {number} [currentAttachmentCount=0] - Number of existing attachments in the current message.
 * @returns {Promise<Attachment[]>} Array of successfully uploaded attachments.
 * @throws {Error} If upload fails critically, but generally handles errors with toasts.
 * @example
 * const model = { name: 'GPT-4', model: 'gpt-4', supportedMediaTypes: ['image/*', 'text/*'] };
 * const files = [new File(['content'], 'test.txt', { type: 'text/plain' })];
 * const attachments = await validateAndUploadFiles(files, model);
 */
export async function validateAndUploadFiles(
  files: File[],
  selectedModel: ChatModel,
  currentAttachmentCount = 0
): Promise<Attachment[]> {
  // Check attachment count limit
  if (currentAttachmentCount + files.length > MAX_ATTACHMENTS) {
    toast.error(
      `Cannot attach more than ${MAX_ATTACHMENTS} files. Currently have ${currentAttachmentCount} attachment(s).`
    );
    return [];
  }

  // Check file compatibility before uploading
  const incompatibleFiles: string[] = [];
  const compatibleFiles: File[] = [];

  for (const file of files) {
    const mediaType = getMediaTypeFromFile(file);
    if (isMediaTypeCompatible(mediaType as MediaType, selectedModel)) {
      compatibleFiles.push(file);
    } else {
      incompatibleFiles.push(file.name);
    }
  }

  // Show error for incompatible files
  if (incompatibleFiles.length > 0) {
    const fileList = incompatibleFiles.join(", ");
    toast.error(
      `Cannot attach ${incompatibleFiles.length === 1 ? "file" : "files"} "${fileList}" - not supported by ${selectedModel.name} ${selectedModel.model}`
    );
  }

  // Only upload compatible files
  if (compatibleFiles.length === 0) {
    return [];
  }

  // Check total size
  const totalSize = compatibleFiles.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_ATTACHMENT_SIZE) {
    toast.error(
      `Total file size exceeds ${MAX_TOTAL_ATTACHMENT_SIZE / (1024 * 1024)}MB limit`
    );
    return [];
  }

  try {
    const uploadPromises = compatibleFiles.map((file) => uploadFile(file));
    const uploadedAttachments = await Promise.all(uploadPromises);
    const successfullyUploadedAttachments = uploadedAttachments.filter(
      (attachment): attachment is Attachment => attachment !== undefined
    );

    return successfullyUploadedAttachments;
  } catch (error) {
    console.error("Error uploading files!", error);
    toast.error("Failed to upload files");
    return [];
  }
}

/**
 * Uploads a single file to the server via the upload API.
 * 
 * This is an internal function called by validateAndUploadFiles.
 * 
 * @param {File} file - The file to upload.
 * @returns {Promise<Attachment | undefined>} The attachment object if successful, undefined otherwise.
 * @private
 */
async function uploadFile(file: File): Promise<Attachment | undefined> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const { url, pathname, contentType } = data;

      return {
        url,
        name: pathname,
        contentType,
      };
    }

    const { error } = await response.json();
    toast.error(error);
  } catch (error) {
    console.error("Upload error:", error);
    toast.error("Failed to upload file, please try again!");
  }

  return undefined;
}
