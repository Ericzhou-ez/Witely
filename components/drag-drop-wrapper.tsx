"use client";

import { useCallback, useRef, useState } from "react";
import { FileDropOverlay } from "./file-drop-overlay";

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

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
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
      className="relative h-full w-full"
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
