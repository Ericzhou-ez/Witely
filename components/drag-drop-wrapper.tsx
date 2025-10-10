"use client";

import { useCallback, useRef, useState } from "react";
import { FileDropOverlay } from "./file-drop-overlay";

/**
 * A wrapper component that enables drag-and-drop file upload functionality.
 * It displays an overlay when files are being dragged over the area and handles
 * the drop event by calling the provided callback with the dropped files.
 *
 * This component uses a drag counter to accurately detect when dragging leaves
 * the entire area, preventing premature hiding of the overlay.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be wrapped inside the drag-drop area.
 * @param {string} props.selectedModelId - The ID of the currently selected AI model, passed to the overlay.
 * @param {(files: File[]) => Promise<void>} props.onFilesDropped - Asynchronous callback invoked when files are successfully dropped. Receives an array of File objects.
 * @returns {JSX.Element} The wrapped content with drag-drop handlers.
 */
export function DragDropWrapper({
  children,
  selectedModelId,
  onFilesDropped,
}: {
  children: React.ReactNode;
  selectedModelId: string;
  onFilesDropped: (files: File[]) => Promise<void>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await onFilesDropped(files);
      }
    },
    [onFilesDropped]
  );

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: Drag-drop requires event handlers on the containing div
    <div
      data-testid=\"drag-drop-wrapper\"
      className=\"relative h-full w-full\"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <FileDropOverlay
        isDragging={isDragging}
        selectedModelId={selectedModelId}
      />
      {children}
    </div>
  );
}
"
