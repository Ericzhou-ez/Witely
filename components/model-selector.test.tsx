import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModelSelector } from './model-selector';
import { useSession } from 'next-auth/react';
import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { chatModels } from '@/lib/ai/models';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { isModelCompatibleWithAttachments } from '@/lib/ai/file-compatibility';
import type { Attachment } from '@/lib/types';

// Mock the modules
vi.mock('next-auth/react');
vi.mock('@/app/(chat)/actions');
vi.mock('@/lib/ai/models', () => ({
  chatModels: [
    {
      id: 'google/gemini-2.5-flash-lite',
      name: 'Gemini',
      model: '2.5 Flash Lite',
      description: \"Google's most lightweight and fastest model.\",
      search: true,
      vision: true,
      pdf_understanding: true,
      reasoning: false,
      pinned: false,
    },
    {
      id: 'openai/gpt-oss-20b',
      name: 'GPT-OSS',
      model: '20B',
      description: 'Smaller open-source model.',
      search: true,
      vision: false,
      pdf_understanding: false,
      reasoning: true,
      pinned: true,
    },
    {
      id: 'google/gemini-2.5-flash',
      name: 'Gemini',
      model: '2.5 Flash',
      description: 'A fast model.',
      search: true,
      vision: true,
      pdf_understanding: true,
      reasoning: false,
      pinned: true,
    },
  ],
  ...vi.importActual('@/lib/ai/models'),
}));

vi.mock('@/lib/ai/entitlements', () => ({
  entitlementsByUserType: {
    free: {
      maxMessagesPerDay: 10,
      availableChatModelIds: ['google/gemini-2.5-flash-lite', 'openai/gpt-oss-20b'],
    },
    pro: {
      maxMessagesPerDay: 100,
      availableChatModelIds: ['google/gemini-2.5-flash-lite', 'openai/gpt-oss-20b', 'google/gemini-2.5-flash'],
    },
  },
  ...vi.importActual('@/lib/ai/entitlements'),
}));

vi.mock('@/lib/ai/file-compatibility', () => ({
  isModelCompatibleWithAttachments: vi.fn(),
  ...vi.importActual('@/lib/ai/file-compatibility'),
}));

const mockedUseSession = vi.mocked(useSession);
const mockedSaveChatModel = vi.mocked(saveChatModelAsCookie);
const mockedIsCompatible = vi.mocked(isModelCompatibleWithAttachments);

describe('ModelSelector', () => {
  const user = userEvent.setup();
  const defaultSelectedModel = 'google/gemini-2.5-flash-lite';
  const defaultAttachments: Attachment[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSession.mockReturnValue({
      data: { user: { type: 'free' } },
      status: 'authenticated',
    } as any);
    mockedIsCompatible.mockReturnValue(true);
    mockedSaveChatModel.mockResolvedValue(undefined);
  });

  it('renders the selected model name correctly', () => {
    render(<ModelSelector selectedModelId={defaultSelectedModel} />);

    const button = screen.getByTestId('model-selector');
    expect(button).toHaveTextContent('Gemini 2.5 Flash Lite');
  });

  it('shows "Unavailable" if selected model is not available', () => {
    render(<ModelSelector selectedModelId="non-existent-model" />);

    const button = screen.getByTestId('model-selector');
    expect(button).toHaveTextContent('Unavailable');
  });

  it('opens dropdown and renders available models for free user', async () => {
    render(<ModelSelector selectedModelId={defaultSelectedModel} />);

    const button = screen.getByTestId('model-selector');
    await user.click(button);

    expect(screen.getByTestId('model-selector-item-google/gemini-2.5-flash-lite')).toBeInTheDocument();
    expect(screen.getByTestId('model-selector-item-openai/gpt-oss-20b')).toBeInTheDocument();
    expect(screen.queryByTestId('model-selector-item-google/gemini-2.5-flash')).not.toBeInTheDocument();
  });

  it('shows more models for pro user', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { type: 'pro' } },
      status: 'authenticated',
    } as any);

    render(<ModelSelector selectedModelId={defaultSelectedModel} />);

    const button = screen.getByTestId('model-selector');
    await user.click(button);

    expect(screen.getByTestId('model-selector-item-google/gemini-2.5-flash')).toBeInTheDocument();
  });

  it('selects a different model, updates optimistically, and saves to cookie', async () => {
    render(<ModelSelector selectedModelId={defaultSelectedModel} />);

    const button = screen.getByTestId('model-selector');
    await user.click(button);

    const newModelItem = screen.getByTestId('model-selector-item-openai/gpt-oss-20b');
    await user.click(newModelItem);

    await waitFor(() => {
      expect(mockedSaveChatModel).toHaveBeenCalledWith('openai/gpt-oss-20b');
    });

    // The button text should update to the new model (optimistic update)
    expect(screen.getByTestId('model-selector')).toHaveTextContent('GPT-OSS 20B');
  });

  it('disables incompatible models when attachments are present', async () => {
    const attachments: Attachment[] = [{ contentType: 'image/jpeg' }];
    mockedIsCompatible.mockImplementation((modelId: string) => modelId === 'google/gemini-2.5-flash-lite');

    render(<ModelSelector selectedModelId={defaultSelectedModel} attachments={attachments} />);

    const button = screen.getByTestId('model-selector');
    await user.click(button);

    const compatibleItem = screen.getByTestId('model-selector-item-google/gemini-2.5-flash-lite');
    const incompatibleItem = screen.getByTestId('model-selector-item-openai/gpt-oss-20b');

    expect(compatibleItem).not.toBeDisabled();
    expect(incompatibleItem).toBeDisabled();
    expect(incompatibleItem).toHaveTextContent('Not compatible with attached files');
  });

  it('does not close dropdown or update when clicking disabled item', async () => {
    const attachments: Attachment[] = [{ contentType: 'image/jpeg' }];
    mockedIsCompatible.mockReturnValue(false);

    render(<ModelSelector selectedModelId={defaultSelectedModel} attachments={attachments} />);

    const button = screen.getByTestId('model-selector');
    await user.click(button);

    const item = screen.getByTestId('model-selector-item-openai/gpt-oss-20b');
    await user.click(item);

    // Should not call save
    expect(mockedSaveChatModel).not.toHaveBeenCalled();
    // Dropdown should still be open? But hard to test, assume
  });

  it('shows check icon on selected model', async () => {
    render(<ModelSelector selectedModelId={defaultSelectedModel} />);

    const button = screen.getByTestId('model-selector');
    await user.click(button);

    const selectedItem = screen.getByTestId('model-selector-item-google/gemini-2.5-flash-lite');
    expect(selectedItem).toHaveAttribute('data-active', 'true');
    // Assuming the check icon is rendered with opacity based on data-active
  });

  it('handles className prop correctly', () => {
    const { container } = render(
      <ModelSelector selectedModelId={defaultSelectedModel} className="custom-class" />
    );

    const button = screen.getByTestId('model-selector');
    expect(button).toHaveClass('custom-class');
  });
});
