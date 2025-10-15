import { GET } from './route';
import * as authModule from '@/app/(auth)/auth';
import * as queriesModule from '@/lib/db/queries';

jest.mock('@/app/(auth)/auth');
jest.mock('@/lib/db/queries');

describe('GET /api/user', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user data for authenticated user', async () => {
    const mockSession = { user: { email: 'test@example.com' } };
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      profileURL: 'https://example.com/profile.jpg',
      type: 'premium',
    };

    (authModule.auth as jest.Mock).mockResolvedValue(mockSession);
    (queriesModule.getUser as jest.Mock).mockResolvedValue([mockUser]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      profileURL: mockUser.profileURL,
      type: mockUser.type,
    });
  });

  it('returns 401 unauthorized if no session', async () => {
    (authModule.auth as jest.Mock).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 404 if user not found', async () => {
    const mockSession = { user: { email: 'test@example.com' } };

    (authModule.auth as jest.Mock).mockResolvedValue(mockSession);
    (queriesModule.getUser as jest.Mock).mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'User not found' });
  });

  it('returns 500 on database error', async () => {
    const mockSession = { user: { email: 'test@example.com' } };
    const dbError = new Error('Database connection failed');

    (authModule.auth as jest.Mock).mockResolvedValue(mockSession);
    (queriesModule.getUser as jest.Mock).mockRejectedValue(dbError);

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Failed to fetch user data' });
  });

  it('returns 500 on auth error', async () => {
    const authError = new Error('Auth service unavailable');

    (authModule.auth as jest.Mock).mockRejectedValue(authError);

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Failed to fetch user data' });
  });
});
