import { describe, it, expect } from 'vitest';
import type { ArtifactKind } from '@/components/artifact';
import {
  artifactsPrompt,
  regularPrompt,
  getRequestPromptFromHints,
  systemPrompt,
  codePrompt,
  sheetPrompt,
  updateDocumentPrompt,
  analyzeAttachmentPrompt,
  type RequestHints,
} from './prompts';

describe('prompts', () => {
  describe('artifactsPrompt', () => {
    it('should be a non-empty string', () => {
      expect(typeof artifactsPrompt).toBe('string');
      expect(artifactsPrompt).toBeTruthy();
      expect(artifactsPrompt.length).toBeGreaterThan(0);
    });
  });

  describe('regularPrompt', () => {
    it('should be a non-empty string', () => {
      expect(typeof regularPrompt).toBe('string');
      expect(regularPrompt).toBeTruthy();
      expect(regularPrompt.length).toBeGreaterThan(0);
    });
  });

  describe('getRequestPromptFromHints', () => {
    it('should generate the correct prompt format', () => {
      const hints: RequestHints = {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        country: 'United States',
      };

      const expected = `About the origin of user's request:
- lat: ${hints.latitude}
- lon: ${hints.longitude}
- city: ${hints.city}
- country: ${hints.country}
`;

      const result = getRequestPromptFromHints(hints);
      expect(result).toBe(expected);
    });
  });

  describe('systemPrompt', () => {
    const requestHints: RequestHints = {
      latitude: 37.7749,
      longitude: -122.4194,
      city: 'San Francisco',
      country: 'United States',
    };

    it('should include regularPrompt and requestPrompt for reasoning model', () => {
      const result = systemPrompt({
        selectedChatModel: 'chat-model-reasoning',
        requestHints,
      });

      const requestPrompt = getRequestPromptFromHints(requestHints);
      const expected = `${regularPrompt}\n\n${requestPrompt}`;
      expect(result).toContain(regularPrompt);
      expect(result).toContain(requestPrompt);
      expect(result).not.toContain(artifactsPrompt);
    });

    it('should include artifactsPrompt for non-reasoning models', () => {
      const result = systemPrompt({
        selectedChatModel: 'gpt-4',
        requestHints,
      });

      const requestPrompt = getRequestPromptFromHints(requestHints);
      expect(result).toContain(regularPrompt);
      expect(result).toContain(requestPrompt);
      expect(result).toContain(artifactsPrompt);
    });
  });

  describe('codePrompt', () => {
    it('should be a non-empty string', () => {
      expect(typeof codePrompt).toBe('string');
      expect(codePrompt).toBeTruthy();
      expect(codePrompt.length).toBeGreaterThan(0);
    });
  });

  describe('sheetPrompt', () => {
    it('should be a non-empty string', () => {
      expect(typeof sheetPrompt).toBe('string');
      expect(sheetPrompt).toBeTruthy();
      expect(sheetPrompt.length).toBeGreaterThan(0);
    });
  });

  describe('updateDocumentPrompt', () => {
    const currentContent = 'Existing content';

    it('should use "document" for default type', () => {
      const result = updateDocumentPrompt(currentContent, 'document' as ArtifactKind);
      expect(result).toContain('Improve the following contents of the document');
      expect(result).toContain(currentContent);
    });

    it('should use "code snippet" for code type', () => {
      const result = updateDocumentPrompt(currentContent, 'code' as ArtifactKind);
      expect(result).toContain('Improve the following contents of the code snippet');
      expect(result).toContain(currentContent);
    });

    it('should use "spreadsheet" for sheet type', () => {
      const result = updateDocumentPrompt(currentContent, 'sheet' as ArtifactKind);
      expect(result).toContain('Improve the following contents of the spreadsheet');
      expect(result).toContain(currentContent);
    });

    it('should handle null currentContent', () => {
      const result = updateDocumentPrompt(null, 'document' as ArtifactKind);
      expect(result).toContain('Improve the following contents of the document');
      expect(result).toContain('null'); // Since it's string | null, it will include "null"
    });
  });

  describe('analyzeAttachmentPrompt', () => {
    it('should be a non-empty string', () => {
      expect(typeof analyzeAttachmentPrompt).toBe('string');
      expect(analyzeAttachmentPrompt).toBeTruthy();
      expect(analyzeAttachmentPrompt.length).toBeGreaterThan(0);
    });
  });
});
