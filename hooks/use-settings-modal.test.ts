import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsModal } from './use-settings-modal';

describe('useSettingsModal', () => {
  beforeEach(() => {
    useSettingsModal.setState({ isOpen: false, isExpanded: false });
  });

  it('should initialize with isOpen false and isExpanded false', () => {
    const { isOpen, isExpanded } = useSettingsModal.getState();
    expect(isOpen).toBe(false);
    expect(isExpanded).toBe(false);
  });

  it('should open the modal', () => {
    useSettingsModal.getState().open();
    const { isOpen } = useSettingsModal.getState();
    expect(isOpen).toBe(true);
  });

  it('should close the modal and reset expanded', () => {
    useSettingsModal.setState({ isOpen: true, isExpanded: true });
    useSettingsModal.getState().close();
    const { isOpen, isExpanded } = useSettingsModal.getState();
    expect(isOpen).toBe(false);
    expect(isExpanded).toBe(false);
  });

  it('should toggle the modal open state', () => {
    // Start closed
    let { isOpen } = useSettingsModal.getState();
    expect(isOpen).toBe(false);

    useSettingsModal.getState().toggle();
    ({ isOpen } = useSettingsModal.getState());
    expect(isOpen).toBe(true);

    useSettingsModal.getState().toggle();
    ({ isOpen } = useSettingsModal.getState());
    expect(isOpen).toBe(false);
  });

  it('should set expanded state', () => {
    useSettingsModal.getState().setExpanded(true);
    const { isExpanded } = useSettingsModal.getState();
    expect(isExpanded).toBe(true);

    useSettingsModal.getState().setExpanded(false);
    ({ isExpanded } = useSettingsModal.getState());
    expect(isExpanded).toBe(false);
  });

  it('should toggle expanded state', () => {
    // Start false
    let { isExpanded } = useSettingsModal.getState();
    expect(isExpanded).toBe(false);

    useSettingsModal.getState().toggleExpanded();
    ({ isExpanded } = useSettingsModal.getState());
    expect(isExpanded).toBe(true);

    useSettingsModal.getState().toggleExpanded();
    ({ isExpanded } = useSettingsModal.getState());
    expect(isExpanded).toBe(false);
  });

  it('should not affect expanded when opening', () => {
    useSettingsModal.setState({ isExpanded: true });
    useSettingsModal.getState().open();
    const { isOpen, isExpanded } = useSettingsModal.getState();
    expect(isOpen).toBe(true);
    expect(isExpanded).toBe(true);
  });
});
