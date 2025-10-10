import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from './route';
import * as authModule from '@/app/(auth)/auth';
import * as queries from '@/lib/db/queries';
import * as utils from '@/lib/utils';
import * as fileCompatibility from '@/lib/ai/file-compatibility';
import { geolocation } from '@vercel/functions';
import type { ChatMessage } from '@/lib/types';

vi.mock('@/app/(auth)/auth');
vi.mock('@/lib/db/queries');
vi.mock('@/lib/utils');
vi.mock('@/lib/ai/file-compatibility');
vi.mock('@vercel/functions');
vi.mock('ai');
vi.mock('resumable-stream');

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(geolocation).mockReturnValue({ longitude: 0, latitude: 0, city: '', country: '' });
  });

  describe('POST /api/chat', () => {
    it('returns 401 Unauthorized if no session', async () => {
      vi.mocked(authModule.auth).mockResolvedValue(null);

      const requestBody = {
        id: 'chat-1',
        message: {
          id: 'msg-1',
          role: 'user' as const,
          parts: [{ type: 'text' as const, text: 'Hello' }]
        },
        selectedChatModel: 'gpt-4',
        selectedVisibilityType: 'private' as const
      };

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request as any);
      expect(response.status).toBe(401);
    });

    it('returns 400 Bad Request for incompatible files', async () => {
      const session = { user: { id: 'user-1', type: 'user' as const } };
      vi.mocked(authModule.auth).mockResolvedValue(session);
      vi.mocked(queries.getMessageCountByUserId).mockResolvedValue(0);

      vi.spyOn(fileCompatibility, 'validateFileCompatibility').mockReturnValue([
        { name: 'incompatible.pdf', reason: 'Model does not support PDF' }
      ]);

      const requestBody = {
        id: 'chat-1',
        message: {
          id: 'msg-1',
          role: 'user' as const,
          parts: [
            {
              type: 'file' as const,
              name: 'incompatible.pdf',
              url: 'http://example.com/file.pdf',
              mediaType: 'application/pdf'
            }
          ]
        },
        selectedChatModel: 'gpt-4',
        selectedVisibilityType: 'private' as const
      };

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request as any);
      expect(response.status).toBe(400);
      expect(await (response as Response).json()).toHaveProperty('error');
    });

    it('returns 429 Rate Limit exceeded', async () => {
      const session = { user: { id: 'user-1', type: 'user' as const } };
      vi.mocked(authModule.auth).mockResolvedValue(session);
      vi.mocked(queries.getMessageCountByUserId).mockResolvedValue(100); // Assume limit is 50

      const requestBody = {
        id: 'chat-1',
        message: { id: 'msg-1', role: 'user' as const, parts: [{ type: 'text' as const, text: 'Hello' }] },
        selectedChatModel: 'gpt-4',
        selectedVisibilityType: 'private' as const
      };

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request as any);
      expect(response.status).toBe(429);
    });

    it('creates new chat and returns streaming response', async () => {
      const session = { user: { id: 'user-1', type: 'user' as const } };
      vi.mocked(authModule.auth).mockResolvedValue(session);
      vi.mocked(queries.getMessageCountByUserId).mockResolvedValue(0);
      vi.mocked(queries.getChatById).mockResolvedValue(null);
      vi.mocked(queries.getMessagesByChatId).mockResolvedValue([]);
      vi.mocked(utils.generateTitleFromUserMessage).mockResolvedValue('Test Chat');
      vi.mocked(queries.saveChat).mockResolvedValue(undefined);
      vi.mocked(queries.saveMessages).mockResolvedValue(undefined);
      vi.mocked(utils.generateUUID).mockReturnValue('uuid-1');
      vi.mocked(queries.createStreamId).mockResolvedValue(undefined);

      // Mock AI stream
      const { createUIMessageStream } = await import('ai');
      vi.spyOn(require('ai'), 'createUIMessageStream').mockReturnValue(new ReadableStream() as any);

      const requestBody = {
        id: 'chat-1',
        message: { id: 'msg-1', role: 'user' as const, parts: [{ type: 'text' as const, text: 'Hello' }] },
        selectedChatModel: 'gpt-4',
        selectedVisibilityType: 'private' as const
      };

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request as any);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/event-stream');
      expect(response.body).toBeDefined();
    });

    it('handles text file processing', async () => {
      // To test internal function, we can import and call directly if exported, or test via route
      // For now, assuming we test via route or separately
      // Mock fetch for text file
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('File content\\nLine 2')
      }) as any;

      const session = { user: { id: 'user-1', type: 'user' as const } };
      vi.mocked(authModule.auth).mockResolvedValue(session);
      // ... other mocks

      const requestBody = {
        id: 'chat-1',
        message: {
          id: 'msg-1',
          role: 'user' as const,
          parts: [
            {
              type: 'file' as const,
              name: 'test.txt',
              url: 'http://example.com/test.txt',
              mediaType: 'text/plain'
            },
            { type: 'text' as const, text: 'Original' }
          ]
        },
        selectedChatModel: 'gpt-4',
        selectedVisibilityType: 'private' as const
      };

      const request = new Request('http://localhost/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      // Since streaming, hard to test content, but check if fetch was called
      await POST(request as any);
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/test.txt', expect.any(Object));

      global.fetch = originalFetch;
    });
  });

  describe('DELETE /api/chat', () => {
    it('deletes chat if authorized', async () => {
      const session = { user: { id: 'user-1', type: 'user' as const } };
      vi.mocked(authModule.auth).mockResolvedValue(session);
      vi.mocked(queries.getChatById).mockResolvedValue({ id: 'chat-1', userId: 'user-1' });
      vi.mocked(queries.deleteChatById).mockResolvedValue({ id: 'chat-1' });

      const request = new Request('http://localhost/api/chat?id=chat-1', {
        method: 'DELETE'
      });

      const response = await DELETE(request as any);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ id: 'chat-1' });
    });

    it('returns 403 Forbidden if not owner', async () => {
      const session = { user: { id: 'user-1', type: 'user' as const } };
      vi.mocked(authModule.auth).mockResolvedValue(session);
      vi.mocked(queries.getChatById).mockResolvedValue({ id: 'chat-1', userId: 'user-2' });

      const request = new Request('http://localhost/api/chat?id=chat-1', {
        method: 'DELETE'
      });

      const response = await DELETE(request as any);
      expect(response.status).toBe(403);
    });

    it('returns 400 Bad Request if no id', async () => {
      const request = new Request('http://localhost/api/chat', {
        method: 'DELETE'
      });

      const response = await DELETE(request as any);
      expect(response.status).toBe(400);
    });
  });
});
