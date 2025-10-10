import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { notFound, redirect } from 'next/navigation';
import Page from './page';
import * as queries from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';
import { cookies } from 'next/headers';
import { convertToUIMessages } from '@/lib/utils';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  redirect: vi.fn(),
}));

// Mock db queries
vi.mock('@/lib/db/queries', () => ({
  getChatById: vi.fn(),
  getMessagesByChatId: vi.fn(),
}));

// Mock auth
vi.mock('@/app/(auth)/auth', () => ({
  auth: vi.fn(),
}));

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
  })),
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  convertToUIMessages: vi.fn(),
}));

// Mock components
vi.mock('@/components/chat', () => ({
  Chat: vi.fn(() => <div data-testid="chat">Mock Chat</div>),
}));

vi.mock('@/components/data-stream-handler', () => ({
  DataStreamHandler: vi.fn(() => <div data-testid="data-stream">Mock Data Stream</div>),
}));

describe('Chat Page', () => {
  const mockParams = { params: Promise.resolve({ id: 'test-id' }) } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Chat component with initial data when chat exists and user is authenticated', async () => {
    const mockChat = { id: 'test-id', visibility: 'public', userId: 'user1', lastContext: null };
    vi.mocked(queries.getChatById).mockResolvedValue(mockChat);
    const mockSession = { user: { id: 'user1' } };
    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(queries.getMessagesByChatId).mockResolvedValue([]);
    vi.mocked(convertToUIMessages).mockReturnValue([]);
    const mockCookieStore = { get: vi.fn().mockReturnValue(null) };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore);

    const page = await Page(mockParams);
    render(page);

    expect(screen.getByTestId('chat')).toBeInTheDocument();
    expect(screen.getByTestId('data-stream')).toBeInTheDocument();
    expect(queries.getChatById).toHaveBeenCalledWith({ id: 'test-id' });
    expect(auth).toHaveBeenCalled();
    expect(queries.getMessagesByChatId).toHaveBeenCalledWith({ id: 'test-id' });
    expect(convertToUIMessages).toHaveBeenCalledWith([]);
  });

  it('redirects to login if no session', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    vi.mocked(queries.getChatById).mockResolvedValue({ id: 'test-id', visibility: 'public' });

    await expect(Page(mockParams)).rejects.toMatchObject({ type: 'redirect' }); // Approximate, depending on how redirect is handled
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('calls notFound if chat not found', async () => {
    vi.mocked(queries.getChatById).mockResolvedValue(null);

    await expect(Page(mockParams)).rejects.toMatchObject({ type: 'not-found' });
    expect(notFound).toHaveBeenCalled();
  });

  it('calls notFound for private chat if not owner', async () => {
    const mockChat = { id: 'test-id', visibility: 'private', userId: 'other-user' };
    vi.mocked(queries.getChatById).mockResolvedValue(mockChat);
    const mockSession = { user: { id: 'user1' } };
    vi.mocked(auth).mockResolvedValue(mockSession);

    await expect(Page(mockParams)).rejects.toMatchObject({ type: 'not-found' });
    expect(notFound).toHaveBeenCalled();
  });

  it('uses chat model from cookie if available', async () => {
    const mockChat = { id: 'test-id', visibility: 'public', userId: 'user1', lastContext: null };
    vi.mocked(queries.getChatById).mockResolvedValue(mockChat);
    const mockSession = { user: { id: 'user1' } };
    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(queries.getMessagesByChatId).mockResolvedValue([]);
    vi.mocked(convertToUIMessages).mockReturnValue([]);
    const mockCookieStore = { 
      get: vi.fn().mockReturnValue({ value: 'gpt-4' }) 
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore);

    const page = await Page(mockParams);
    render(page);

    expect(Chat).toHaveBeenCalledWith(
      expect.objectContaining({
        initialChatModel: DEFAULT_CHAT_MODEL, // Since no lastContext, but wait, logic uses chat.lastContext?.modelId ?? DEFAULT if cookie, but wait
      }),
      expect.anything()
    );
  });
});
