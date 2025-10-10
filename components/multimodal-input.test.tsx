import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultimodalInput } from './multimodal-input';
import { vi } from 'vitest'; // Assuming Vitest is used, or jest

// Mock dependencies
vi.mock('@/app/(chat)/actions', () => ({
  saveChatModelAsCookie: vi.fn(),
}));

vi.mock('@/lib/ai/file-compatibility', () => ({
  isModelCompatibleWithAttachments: vi.fn(() => true),
}));

vi.mock('@/lib/ai/models', () => ({
  chatModels: [
    { id: 'gpt-4', name: 'GPT-4', model: 'gpt-4', description: 'Description' },
  ],
}));

vi.mock('@/lib/ai/providers', () => ({
  myProvider: {
    languageModel: vi.fn(() => ({})),
  },
}));

vi.mock('@/lib/ai/file-upload', () => ({
  validateAndUploadFiles: vi.fn(() => Promise.resolve([
    { url: 'mock-url', name: 'mock-file.txt', contentType: 'text/plain' }
  ])),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('usehooks-ts', () => ({
  useLocalStorage: vi.fn(() => ['initial', vi.fn()]),
  useWindowSize: vi.fn(() => ({ width: 1024 })),
}));

const mockSendMessage = vi.fn();
const mockSetInput = vi.fn();
const mockSetAttachments = vi.fn();
const mockStop = vi.fn();
const mockSetMessages = vi.fn();
const mockOnModelChange = vi.fn();
const mockScrollToBottom = vi.fn();

const defaultProps = {
  chatId: 'test-chat',
  input: '',
  setInput: mockSetInput,
  status: 'ready' as const,
  stop: mockStop,
  attachments: [],
  setAttachments: mockSetAttachments,
  messages: [],
  setMessages: mockSetMessages,
  sendMessage: mockSendMessage,
  selectedVisibilityType: 'public' as any,
  selectedModelId: 'gpt-4',
  onModelChange: mockOnModelChange,
  usage: undefined,
  isAtBottom: true,
  scrollToBottom: mockScrollToBottom,
};

describe('MultimodalInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MultimodalInput {...defaultProps} />);
    expect(screen.getByTestId('multimodal-input')).toBeInTheDocument();
  });

  it('handles text input change', async () => {
    const user = userEvent.setup();
    render(<MultimodalInput {...defaultProps} />);
    const textarea = screen.getByTestId('multimodal-input');
    await user.type(textarea, 'Hello world');
    expect(mockSetInput).toHaveBeenCalledWith('Hello world');
  });

  it('handles file upload', async () => {
    const user = userEvent.setup();
    const mockValidateAndUploadFiles = require('@/lib/ai/file-upload').validateAndUploadFiles;
    mockValidateAndUploadFiles.mockResolvedValueOnce([
      { url: 'test-url', name: 'test.txt', contentType: 'text/plain' }
    ]);

    render(<MultimodalInput {...defaultProps} />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByRole('button', { name: /attachments/i }); // Assuming button triggers click on hidden input
    await user.click(fileInput);

    // Since it's hidden input, we need to find the input and upload
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (hiddenInput) {
      Object.defineProperty(hiddenInput, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(hiddenInput, { target: { files: [file] } });
    }

    await waitFor(() => {
      expect(mockSetAttachments).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ url: 'test-url', name: 'test.txt' })
      ]));
    });

    expect(screen.getByTestId('attachments-preview')).toBeInTheDocument();
  });

  it('submits message with text', async () => {
    const user = userEvent.setup();
    render(<MultimodalInput {...defaultProps} input="Hello" />);
    const textarea = screen.getByTestId('multimodal-input');
    const submitButton = screen.getByRole('button', { name: /arrow up/i }); // Adjust selector

    await user.type(textarea, '{enter}'); // Or click submit

    expect(mockSendMessage).toHaveBeenCalledWith({
      role: 'user',
      parts: [{ type: 'text', text: 'Hello' }]
    });
  });

  // Additional tests can be added for model selection, stop button, etc.
});
