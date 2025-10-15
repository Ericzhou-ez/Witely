import { describe, it, expect } from 'vitest';
import type { User, Chat, DBMessage, Vote, Document, Suggestion, Stream, Personalization } from './schema';
import { user, chat, message, vote, document, suggestion, stream, personalization, userTypeEnum } from './schema';
import { eq } from 'drizzle-orm';

// Basic type tests (static analysis)
describe('Schema Types', () => {
  it('User type has expected properties', () => {
    const userType: User = {
      id: 'uuid',
      email: 'test@example.com',
      name: 'Test User',
      type: 'free',
      profileURL: 'https://example.com',
      password: 'hashed',
    };
    expect(userType).toBeDefined();
    expect(userType.email).toBeTypeOf('string');
    expect(userType.type).toBeTypeOf('string');
  });

  it('Personalization type has expected properties', () => {
    const persType: Personalization = {
      id: 'uuid',
      userId: 'uuid',
      information: { name: 'Test', age: 30 },
      bio: 'Test bio',
    };
    expect(persType).toBeDefined();
    expect(persType.information).toBeTypeOf('object');
    expect(persType.bio).toBeTypeOf('string');
  });

  it('Chat type has expected properties', () => {
    const chatType: Chat = {
      id: 'uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
      title: 'Test Chat',
      userId: 'uuid',
      visibility: 'private',
      lastContext: null,
    };
    expect(chatType).toBeDefined();
    expect(chatType.visibility).toBeTypeOf('string');
  });

  it('User type enum is defined', () => {
    expect(userTypeEnum.enumValues).toContain('free');
    expect(userTypeEnum.enumValues).toContain('plus');
  });
});

// Note: For full integration tests, set up an in-memory DB like PGlite or SQLite.
// These are basic schema validation tests to ensure definitions are correct.
