# File Upload Implementation Guide

## Overview

This document describes the file upload implementation for the Witely chat application, including security measures, type safety, and best practices.

## Key Features

### 1. File Type Support

The application supports multiple file types based on model capabilities:

-  **Images**: JPEG, PNG, HEIC (requires `vision` capability)
-  **Documents**: PDF (requires `pdf_understanding` capability)
-  **Text Files**: TXT, CSV, Markdown (supported by all models)

### 2. Security Measures

#### Upload Route Security

-  **Authentication**: All uploads require valid session authentication
-  **Filename Sanitization**: Filenames are sanitized to prevent path traversal attacks
-  **User Isolation**: Files are stored in user-specific directories with timestamps
-  **Size Limits**:
   -  Images: 5MB max
   -  PDFs: 10MB max
   -  Text files: 0.5MB max
   -  Total attachment size: 50MB per message

#### Validation

-  File type validation on both client and server
-  MIME type checking
-  Model compatibility verification
-  Maximum attachment count (8 files per message)

### 3. Type Safety

All file operations use proper TypeScript types:

```typescript
type MediaType =
   | "image/jpeg"
   | "image/png"
   | "image/heic"
   | "application/pdf"
   | "text/plain"
   | "text/csv"
   | "text/markdown"
   | "application/csv";

type FileAttachment = {
   name: string;
   url: string;
   mediaType: MediaType;
};
```

### 4. Error Handling

-  Comprehensive error messages for users
-  Detailed error logging for debugging
-  Graceful degradation on upload failures
-  Compatibility warnings when switching models

## Architecture

### Components

1. **file-upload.ts**: Shared utility for file validation and upload
2. **file-compatibility.ts**: Model compatibility checking
3. **upload/route.ts**: Server-side upload endpoint
4. **multimodal-input.tsx**: File selection UI
5. **drag-drop-wrapper.tsx**: Drag-and-drop functionality

### Flow

1. User selects or drops files
2. Client validates file types against selected model
3. Incompatible files are rejected with user-friendly messages
4. Compatible files are uploaded to Vercel Blob
5. Files are attached to the message
6. Server processes files based on type:
   -  Images: Passed to model directly
   -  PDFs: Passed to model (if supported)
   -  Text files: Content fetched and appended to message text

## Best Practices

1. **Always validate on both client and server**
2. **Use proper TypeScript types** - avoid `any`
3. **Sanitize user inputs** - especially filenames
4. **Provide clear feedback** to users about compatibility issues
5. **Handle errors gracefully** - don't expose internal errors
6. **Test with various file types and sizes**

## Known Limitations

1. Text files fetched from URLs have a 30-second timeout
2. Text file content is limited to 0.5MB to prevent context overflow
3. Maximum 10 attachments per message
4. Files are stored permanently on Vercel Blob (consider cleanup strategy)

## Future Improvements

1. Implement automatic file cleanup for deleted chats
2. Add progress indicators for large file uploads
3. Support batch file processing
4. Add file preview before upload
5. Implement file compression for large images
