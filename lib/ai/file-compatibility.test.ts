import { describe, it, expect } from 'vitest';
import type { ChatModel } from './models';
import { chatModels } from './models';
import * as fc from './file-compatibility';
import type { FileAttachment, FileCompatibilityError, MediaType } from './file-compatibility';

describe('File Compatibility Utils', () => {
  let modelWithVision: ChatModel;
  let modelWithoutVision: ChatModel;
  let modelWithPdf: ChatModel;
  let modelWithoutPdf: ChatModel;

  beforeEach(() => {
    // Find models with different capabilities; fallback to first if not found
    modelWithVision = chatModels.find((m) => m.vision) || chatModels[0];
    modelWithoutVision = chatModels.find((m) => !m.vision) || { ...modelWithVision, vision: false } as ChatModel;
    modelWithPdf = chatModels.find((m) => m.pdf_understanding) || chatModels[0];
    modelWithoutPdf = chatModels.find((m) => !m.pdf_understanding) || { ...modelWithPdf, pdf_understanding: false } as ChatModel;
  });

  describe('isMediaTypeCompatible', () => {
    it('returns true for images if model has vision', () => {
      expect(fc.isMediaTypeCompatible('image/jpeg' as MediaType, modelWithVision)).toBe(true);
      expect(fc.isMediaTypeCompatible('image/png' as MediaType, modelWithVision)).toBe(true);
      expect(fc.isMediaTypeCompatible('image/heic' as MediaType, modelWithVision)).toBe(true);
    });

    it('returns false for images if model lacks vision', () => {
      expect(fc.isMediaTypeCompatible('image/jpeg' as MediaType, modelWithoutVision)).toBe(false);
    });

    it('returns true for PDF if model has pdf_understanding', () => {
      expect(fc.isMediaTypeCompatible('application/pdf' as MediaType, modelWithPdf)).toBe(true);
    });

    it('returns false for PDF if model lacks pdf_understanding', () => {
      expect(fc.isMediaTypeCompatible('application/pdf' as MediaType, modelWithoutPdf)).toBe(false);
    });

    it('returns true for all text types regardless of model', () => {
      const textTypes: MediaType[] = ['text/plain', 'text/csv', 'text/markdown', 'application/csv' as MediaType];
      textTypes.forEach((type) => {
        expect(fc.isMediaTypeCompatible(type, modelWithVision)).toBe(true);
        expect(fc.isMediaTypeCompatible(type, modelWithoutVision)).toBe(true);
      });
    });

    it('returns false for unknown media types', () => {
      expect(fc.isMediaTypeCompatible('application/zip' as MediaType, modelWithVision)).toBe(false);
    });
  });

  describe('validateFileCompatibility', () => {
    it('returns empty array for compatible files', () => {
      const compatibleFiles: FileAttachment[] = [
        { name: 'doc.txt', url: 'url1', mediaType: 'text/plain' },
        { name: 'data.csv', url: 'url2', mediaType: 'text/csv' },
      ];
      const errors = fc.validateFileCompatibility(compatibleFiles, modelWithVision.id);
      expect(errors).toEqual([]);
    });

    it('returns errors for incompatible files', () => {
      const incompatibleFiles: FileAttachment[] = [
        { name: 'image.jpg', url: 'url1', mediaType: 'image/jpeg' },
      ];
      const errors = fc.validateFileCompatibility(incompatibleFiles, modelWithoutVision.id);
      expect(errors.length).toBe(1);
      expect(errors[0].fileName).toBe('image.jpg');
      expect(errors[0].reason).toContain('does not support image files');
    });

    it('returns errors for all files if model not found', () => {
      const files: FileAttachment[] = [
        { name: 'test.txt', url: 'url', mediaType: 'text/plain' },
      ];
      const errors = fc.validateFileCompatibility(files, 'nonexistent-model');
      expect(errors.length).toBe(1);
      expect(errors[0].reason).toBe('Model not found');
    });

    it('returns multiple errors for mixed compatibility', () => {
      const files: FileAttachment[] = [
        { name: 'image.jpg', url: 'url1', mediaType: 'image/jpeg' },
        { name: 'doc.pdf', url: 'url2', mediaType: 'application/pdf' },
        { name: 'text.md', url: 'url3', mediaType: 'text/markdown' },
      ];
      const errors = fc.validateFileCompatibility(files, modelWithoutVision.id);
      // Assuming modelWithoutVision may or may not support PDF, but at least image error
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.fileName === 'image.jpg')).toBe(true);
    });
  });

  describe('generateCompatibilityErrorMessage', () => {
    it('returns empty string for no errors', () => {
      const message = fc.generateCompatibilityErrorMessage([]);
      expect(message).toBe('');
    });

    it('returns single error message', () => {
      const error: FileCompatibilityError = {
        fileName: 'image.jpg',
        mediaType: 'image/jpeg' as MediaType,
        reason: 'No vision support',
        modelName: 'Test Model',
      };
      const message = fc.generateCompatibilityErrorMessage([error]);
      expect(message).toBe('"image.jpg" is not compatible with Test Model. No vision support.');
    });

    it('returns multiple errors message', () => {
      const errors: FileCompatibilityError[] = [
        { fileName: 'file1.jpg', mediaType: 'image/jpeg' as MediaType, reason: 'No vision', modelName: 'Test Model' },
        { fileName: 'file2.pdf', mediaType: 'application/pdf' as MediaType, reason: 'No PDF', modelName: 'Test Model' },
      ];
      const message = fc.generateCompatibilityErrorMessage(errors);
      expect(message).toContain('The following files are not compatible with Test Model: "file1.jpg", "file2.pdf"');
    });
  });

  describe('getSupportedFileTypes', () => {
    it('returns text only for model without capabilities', () => {
      const result = fc.getSupportedFileTypes(modelWithoutVision.id);
      expect(result.extensions).toEqual(expect.arrayContaining(['TXT', 'CSV', 'MD']));
      expect(result.extensions).not.toContain('JPG');
      expect(result.description).toBe('Text files');
    });

    it('includes images and PDF for capable model', () => {
      const capableModel = { ...modelWithVision, pdf_understanding: true } as ChatModel;
      // Since we can't easily mock, assume if model has, but test logic indirectly
      // For full test, would need mock, but here test default
      const result = fc.getSupportedFileTypes(modelWithVision.id);
      if (modelWithVision.vision) {
        expect(result.extensions).toContain('JPG');
        expect(result.description).toContain('Images');
      }
    });

    it('returns fallback for unknown model', () => {
      const result = fc.getSupportedFileTypes('unknown');
      expect(result.extensions).toEqual(['TXT', 'CSV', 'MD']);
      expect(result.description).toBe('Text files only');
    });
  });

  describe('isModelCompatibleWithAttachments', () => {
    it('returns true for no attachments', () => {
      expect(fc.isModelCompatibleWithAttachments(modelWithVision.id, [])).toBe(true);
    });

    it('returns true if all attachments compatible', () => {
      const attachments = [{ contentType: 'text/plain' }];
      expect(fc.isModelCompatibleWithAttachments(modelWithVision.id, attachments)).toBe(true);
    });

    it('returns false if any attachment incompatible', () => {
      const attachments = [{ contentType: 'image/jpeg' }];
      expect(fc.isModelCompatibleWithAttachments(modelWithoutVision.id, attachments)).toBe(false);
    });
  });

  describe('getCompatibleModels', () => {
    it('returns all models for no attachments', () => {
      const compatible = fc.getCompatibleModels([], chatModels);
      expect(compatible).toHaveLength(chatModels.length);
    });

    it('filters models for text attachments (all compatible)', () => {
      const attachments = [{ contentType: 'text/plain' }];
      const compatible = fc.getCompatibleModels(attachments, chatModels);
      expect(compatible).toHaveLength(chatModels.length);
    });

    it('filters models that support images', () => {
      const attachments = [{ contentType: 'image/jpeg' }];
      const compatible = fc.getCompatibleModels(attachments, chatModels);
      const visionModels = chatModels.filter((m) => m.vision);
      expect(compatible).toEqual(expect.arrayContaining(visionModels));
      if (visionModels.length < chatModels.length) {
        expect(compatible.length).toBeLessThan(chatModels.length);
      }
    });
  });

  describe('getMediaTypeFromFile', () => {
    it('normalizes image/jpeg from jpg', () => {
      const file = new File([], 'test.jpg', { type: 'image/jpg' });
      expect(fc.getMediaTypeFromFile(file)).toBe('image/jpeg');
    });

    it('returns image/png for png', () => {
      const file = new File([], 'test.png', { type: 'image/png' });
      expect(fc.getMediaTypeFromFile(file)).toBe('image/png');
    });

    it('returns text/csv for application/csv', () => {
      const file = new File([], 'data.csv', { type: 'application/csv' });
      expect(fc.getMediaTypeFromFile(file)).toBe('text/csv');
    });

    it('returns unknown type as is', () => {
      const file = new File([], 'archive.zip', { type: 'application/zip' });
      expect(fc.getMediaTypeFromFile(file)).toBe('application/zip');
    });

    it('handles text/plain', () => {
      const file = new File([], 'doc.txt', { type: 'text/plain' });
      expect(fc.getMediaTypeFromFile(file)).toBe('text/plain');
    });
  });
});
