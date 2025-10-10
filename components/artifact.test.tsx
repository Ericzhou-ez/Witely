import { render, screen } from '@testing-library/react';
import { Artifact } from './artifact';
import { useArtifact } from '@/hooks/use-artifact';
import { useSidebar } from './ui/sidebar';
import { useWindowSize } from 'usehooks-ts';
import { useSWRConfig } from 'swr';

// Mock dependencies
jest.mock('@/hooks/use-artifact');
jest.mock('./ui/sidebar');
jest.mock('usehooks-ts');
jest.mock('swr');

const mockUseArtifact = useArtifact as jest.Mock;
const mockUseSidebar = useSidebar as jest.Mock;
const mockUseWindowSize = useWindowSize as jest.Mock;
const mockUseSWRConfig = useSWRConfig as jest.Mock;

describe('Artifact', () => {
  beforeEach(() => {
    mockUseArtifact.mockReturnValue({
      artifact: {
        title: 'Test Artifact',
        documentId: 'test-id',
        kind: 'text',
        content: 'Test content',
        isVisible: true,
        status: 'idle' as const,
        boundingBox: { top: 0, left: 0, width: 800, height: 600 }
      },
      setArtifact: jest.fn(),
      metadata: {},
      setMetadata: jest.fn()
    });

    mockUseSidebar.mockReturnValue({ open: false });

    mockUseWindowSize.mockReturnValue({ width: 1024, height: 768 });

    mockUseSWRConfig.mockReturnValue({ mutate: jest.fn() });
  });

  it('renders without crashing', () => {
    render(
      <Artifact
        chatId="test-chat"
        input=""
        setInput={jest.fn()}
        status="idle"
        stop={jest.fn()}
        attachments={[]}
        setAttachments={jest.fn()}
        sendMessage={jest.fn()}
        messages={[]}
        setMessages={jest.fn()}
        regenerate={jest.fn()}
        votes={[]}
        isReadonly={false}
        selectedVisibilityType="public"
        selectedModelId="test-model"
      />
    );

    expect(screen.getByTestId('artifact')).toBeInTheDocument();
  });

  it('does not render when artifact is not visible', () => {
    mockUseArtifact.mockReturnValue({
      ...mockUseArtifact(),
      artifact: { ...mockUseArtifact().artifact, isVisible: false }
    });

    render(
      <Artifact
        chatId="test-chat"
        input=""
        setInput={jest.fn()}
        status="idle"
        stop={jest.fn()}
        attachments={[]}
        setAttachments={jest.fn()}
        sendMessage={jest.fn()}
        messages={[]}
        setMessages={jest.fn()}
        regenerate={jest.fn()}
        votes={[]}
        isReadonly={false}
        selectedVisibilityType="public"
        selectedModelId="test-model"
      />
    );

    expect(screen.queryByTestId('artifact')).not.toBeInTheDocument();
  });
});
