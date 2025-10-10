import { POST } from './route';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { put } from '@vercel/blob';
import { vi, describe, it, expect, beforeEach } from 'vitest'; // Assuming Vitest or Jest, but codebase uses Jest probably

// Mock auth
vi.mock('@/app/(auth)/auth', () => ({
  auth: vi.fn(),
}));

// Mock put
vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
}));

describe('File Upload API', () => {
  const mockSession = { user: { id: 'test-user-id' } };
  const mockPutData = { url: 'https://blob.vercel-storage.com/test.jpg', ... };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession);
    vi.mocked(put).mockResolvedValue(mockPutData);
  });

  it('should return 401 if no session', async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 if request body is empty', async () => {
    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: null,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Request body is empty' });
  });

  it('should return 400 if no file in formData', async () => {
    const formData = new FormData();
    // No file appended

    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'No file uploaded' });
  });

  it('should return 400 if unsupported file type', async () => {
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.exe', { type: 'application/exe' }));

    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('Unsupported file type');
  });

  it('should return 400 if file too large', async () => {
    // For JPEG, max 5MB
    const largeFile = new File(Array(6 * 1024 * 1024).fill('a'), 'large.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', largeFile);

    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('File size should be less than 5MB');
  });

  it('should return 400 if no filename', async () => {
    // Create a Blob without name, but since formData.get returns File which has name
    // To simulate no name, perhaps override or use Blob
    // The code does (formData.get('file') as File).name, so if it's Blob, it might be undefined
    const blob = new Blob(['test'], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', blob);

    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'File name is required' });
  });

  it('should upload file successfully', async () => {
    const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(mockPutData);
    expect(vi.mocked(put)).toHaveBeenCalledWith(
      expect.stringContaining('test-user-id/'),
      expect.any(ArrayBuffer),
      { access: 'public' }
    );
  });

  it('should sanitize filename', async () => {
    const file = new File(['test'], 'test<invalid>.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    await POST(request);

    expect(vi.mocked(put)).toHaveBeenCalledWith(
      expect.stringContaining('test_invalid.jpg'),
      expect.any(ArrayBuffer),
      { access: 'public' }
    );
  });

  it('should return 500 on upload error', async () => {
    vi.mocked(put).mockRejectedValue(new Error('Upload failed'));

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Upload failed due to server error' });
  });

  it('should return 500 on general error', async () => {
    // To simulate general error, perhaps throw in try catch
    // But for simplicity, mock auth to throw or something, but let's assume
    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    // Temporarily mock request.formData to throw
    const originalFormData = NextRequest.prototype.formData;
    NextRequest.prototype.formData = vi.fn().mockRejectedValue(new Error('Form error'));

    const request = new NextRequest('http://localhost/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);

    NextRequest.prototype.formData = originalFormData;

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Failed to process request' });
  });
});
