import { describe, it, expect } from 'vitest';
import { postRequestBodySchema } from './schema';

const validModel = 'gpt-4o-mini'; // Assuming this is one of the ALL_MODEL_IDS
const validId = '00000000-0000-0000-0000-000000000000';
const validUrl = 'https://example.com/file.pdf';

describe('postRequestBodySchema', () => {
  it('validates a valid request body with text part', () => {
    const validBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'text' as const,
            text: 'Hello, world!',
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it('validates a valid request body with file part', () => {
    const validBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'file' as const,
            mediaType: 'application/pdf',
            name: 'document.pdf',
            url: validUrl,
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'private' as const,
    };

    const result = postRequestBodySchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it('validates a valid request body with multiple parts', () => {
    const validBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'text' as const,
            text: 'Hello',
          },
          {
            type: 'file' as const,
            mediaType: 'image/jpeg',
            name: 'image.jpg',
            url: validUrl,
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it('fails validation when id is not a UUID', () => {
    const invalidBody = {
      id: 'invalid-id',
      message: {
        id: validId,
        role: 'user' as const,
        parts: [{ type: 'text' as const, text: 'Hello' }],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['id']);
  });

  it('fails validation when message id is not a UUID', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: 'invalid-id',
        role: 'user' as const,
        parts: [{ type: 'text' as const, text: 'Hello' }],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'id']);
  });

  it('fails validation when role is invalid', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'assistant' as const, // invalid for user message
        parts: [{ type: 'text' as const, text: 'Hello' }],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'role']);
  });

  it('fails validation when parts array is empty', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'parts']);
  });

  it('fails validation when part type is invalid', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'invalid' as const,
            text: 'Hello',
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'parts', 0, 'type']);
  });

  it('fails validation when text part has empty text', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'text' as const,
            text: '',
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'parts', 0, 'text']);
  });

  it('fails validation when text part exceeds max length', () => {
    const longText = 'a'.repeat(100001);
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'text' as const,
            text: longText,
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'parts', 0, 'text']);
  });

  it('fails validation when file part has invalid mediaType', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'file' as const,
            mediaType: 'invalid/type',
            name: 'file.pdf',
            url: validUrl,
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'parts', 0, 'mediaType']);
  });

  it('fails validation when file part has empty name', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'file' as const,
            mediaType: 'application/pdf',
            name: '',
            url: validUrl,
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'parts', 0, 'name']);
  });

  it('fails validation when file part has too long name', () => {
    const longName = 'a'.repeat(101);
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'file' as const,
            mediaType: 'application/pdf',
            name: longName,
            url: validUrl,
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'parts', 0, 'name']);
  });

  it('fails validation when file part url is invalid', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'file' as const,
            mediaType: 'application/pdf',
            name: 'file.pdf',
            url: 'invalid-url',
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['message', 'parts', 0, 'url']);
  });

  it('fails validation when selectedChatModel is invalid', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [{ type: 'text' as const, text: 'Hello' }],
      },
      selectedChatModel: 'invalid-model',
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['selectedChatModel']);
  });

  it('fails validation when selectedVisibilityType is invalid', () => {
    const invalidBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [{ type: 'text' as const, text: 'Hello' }],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'invalid' as const,
    };

    const result = postRequestBodySchema.safeParse(invalidBody);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(['selectedVisibilityType']);
  });

  it('validates text part with max length', () => {
    const maxText = 'a'.repeat(100000);
    const validBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'text' as const,
            text: maxText,
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });

  it('validates file name with max length', () => {
    const maxName = 'a'.repeat(100);
    const validBody = {
      id: validId,
      message: {
        id: validId,
        role: 'user' as const,
        parts: [
          {
            type: 'file' as const,
            mediaType: 'application/pdf',
            name: maxName,
            url: validUrl,
          },
        ],
      },
      selectedChatModel: validModel,
      selectedVisibilityType: 'public' as const,
    };

    const result = postRequestBodySchema.safeParse(validBody);
    expect(result.success).toBe(true);
  });
});
