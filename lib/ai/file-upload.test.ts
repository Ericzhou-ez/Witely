import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { validateAndUploadFiles, MAX_ATTACHMENTS, MAX_TOTAL_ATTACHMENT_SIZE } from './file-upload';
import type { ChatModel } from './models';
import {
  getMediaTypeFromFile,
  isMediaTypeCompatible,
  type MediaType,
} from './file-compatibility';
import type { Attachment } from '../types';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('./file-compatibility', () => ({
  getMediaTypeFromFile: vi.fn(),
  isMediaTypeCompatible: vi.fn(),
  MediaType: {},
}));

vi.mock('../types', () => ({
  Attachment: {} as any,
}));

// Mock fetch globally for upload
global.fetch = vi.fn() as any;

describe('file-upload', () => {
  const mockModel: ChatModel = {
    id: 'gpt-4',
    name: 'GPT-4',
    model: 'gpt-4',
    supportedMediaTypes: ['text/*', 'image/*'],
    maxTokens: 4096,
    // other properties as needed
  } as ChatModel;

  const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
  const mockImageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
  const mockIncompatibleFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });

  beforeEach(() => {
    vi.clearAllMocks();
    (getMediaTypeFromFile as any).mockImplementation((file: File) => file.type as MediaType);
    (isMediaTypeCompatible as any).mockImplementation((mediaType: MediaType, model: ChatModel) => {
      return model.supportedMediaTypes.some((type) => mediaType.startsWith(type.split('/*')[0]));
    });
    (fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        url: 'https://example.com/test.txt',
        pathname: 'test.txt',
        contentType: 'text/plain',
      }),
    } as Response);
    (toast.error as any).mockClear();
  });

  describe('validateAndUploadFiles', () => {
    it('should upload compatible files successfully', async () => {
      const files = [mockFile];
      const attachments = await validateAndUploadFiles(files, mockModel);

      expect(attachments).toHaveLength(1);
      expect(attachments[0]).toEqual({
        url: 'https://example.com/test.txt',
        name: 'test.txt',
        contentType: 'text/plain',
      });
      expect((fetch as any)).toHaveBeenCalledWith('/api/files/upload', expect.any(Object));
    });

    it('should handle incompatible files and upload only compatible ones', async () => {
      (isMediaTypeCompatible as any).mockReturnValueOnce(false); // for pdf
      (isMediaTypeCompatible as any).mockReturnValueOnce(true); // for txt

      const files = [mockIncompatibleFile, mockFile];
      const attachments = await validateAndUploadFiles(files, mockModel);

      expect(attachments).toHaveLength(1);
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Cannot attach file "test.pdf"'));
      expect((fetch as any)).toHaveBeenCalledTimes(1);
    });

    it('should reject if exceeding max attachments', async () => {
      const files = new Array(MAX_ATTACHMENTS + 1).fill(mockFile);
      const attachments = await validateAndUploadFiles(files, mockModel, MAX_ATTACHMENTS);

      expect(attachments).toHaveLength(0);
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Cannot attach more than 8 files'));
      expect((fetch as any)).not.toHaveBeenCalled();
    });

    it('should reject if total size exceeds limit', async () => {
      const largeFile = new File(new Array(60000000), 'large.txt', { type: 'text/plain' }); // >50MB
      (getMediaTypeFromFile as any).mockReturnValue('text/plain');
      (isMediaTypeCompatible as any).mockReturnValue(true);

      const attachments = await validateAndUploadFiles([largeFile], mockModel);

      expect(attachments).toHaveLength(0);
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Total file size exceeds 50MB limit'));
      expect((fetch as any)).not.toHaveBeenCalled();
    });

    it('should handle upload failure', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Upload failed'));

      const attachments = await validateAndUploadFiles([mockFile], mockModel);

      expect(attachments).toHaveLength(0);
      expect(toast.error).toHaveBeenCalledWith('Failed to upload files');
    });

    it('should return empty array if no compatible files', async () => {
      (isMediaTypeCompatible as any).mockReturnValue(false);

      const attachments = await validateAndUploadFiles([mockFile], mockModel);

      expect(attachments).toHaveLength(0);
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Cannot attach file "test.txt"'));
      expect((fetch as any)).not.toHaveBeenCalled();
    });
  });

  describe('Constants', () => {
    it('MAX_ATTACHMENTS should be 8', () => {
      expect(MAX_ATTACHMENTS).toBe(8);
    });

    it('MAX_TOTAL_ATTACHMENT_SIZE should be 50MB', () => {
      expect(MAX_TOTAL_ATTACHMENT_SIZE).toBe(50 * 1024 * 1024);
    });
  });
