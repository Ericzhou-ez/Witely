import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as authModule from '@/app/(auth)/auth';
import * as queriesModule from '@/lib/db/queries';

vi.mock('@/app/(auth)/auth');
vi.mock('@/lib/db/queries');

describe('GET /api/personalization', () => {
  it('returns unauthorized if no session', async () => {
    vi.mocked(authModule.auth).mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/personalization', { method: 'GET' });

    const response = await GET(request);

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns user not found if user not in DB', async () => {
    const mockSession = { user: { email: 'test@example.com' } };
    vi.mocked(authModule.auth).mockResolvedValue(mockSession);
    vi.mocked(queriesModule.getUser).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/personalization', { method: 'GET' });

    const response = await GET(request);

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('User not found');
  });

  it('returns personalization not found if no records', async () => {
    const mockSession = { user: { email: 'test@example.com' } };
    const mockUser = [{ id: 'user1', email: 'test@example.com' }];
    vi.mocked(authModule.auth).mockResolvedValue(mockSession);
    vi.mocked(queriesModule.getUser).mockResolvedValue(mockUser);
    vi.mocked(queriesModule.getAllPersonalizationsByUserId).mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/personalization', { method: 'GET' });

    const response = await GET(request);

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBe('Personalization data not found');
  });

  it('returns success with personalization data', async () => {
    const mockSession = { user: { email: 'test@example.com' } };
    const mockUser = [{ id: 'user1', email: 'test@example.com' }];
    const mockRecord = [{
      id: 'rec1',
      information: { name: 'John', age: 30 },
      bio: 'I am a test user'
    }];
    vi.mocked(authModule.auth).mockResolvedValue(mockSession);
    vi.mocked(queriesModule.getUser).mockResolvedValue(mockUser);
    vi.mocked(queriesModule.getAllPersonalizationsByUserId).mockResolvedValue(mockRecord);

    const request = new NextRequest('http://localhost/api/personalization', { method: 'GET' });

    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.personalization).toEqual({
      name: 'John',
      age: 30,
      bio: 'I am a test user'
    });
  });

  it('handles errors', async () => {
    const mockSession = { user: { email: 'test@example.com' } };
    vi.mocked(authModule.auth).mockResolvedValue(mockSession);
    vi.mocked(queriesModule.getUser).mockRejectedValue(new Error('DB error'));

    const request = new NextRequest('http://localhost/api/personalization', { method: 'GET' });

    const response = await GET(request);

    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Failed to get personalization');
  });
});