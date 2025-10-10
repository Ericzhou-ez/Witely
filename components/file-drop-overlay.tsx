"use client";

import Image from \"next/image\";
import { getSupportedFileTypes } from \"@/lib/ai/file-compatibility\";
import { cn } from \"@/lib/utils\";
import { useSidebar } from \"./ui/sidebar\";

/**
 * FileDropOverlay is a visual overlay component that appears when the user is dragging files over the application.
 * It provides feedback by showing an icon, title, and the list of supported file extensions based on the selected AI model.
 * The overlay is positioned fixed and covers the entire viewport, adjusting for sidebar presence.
 *
 * @param {Object} props - The component props
 * @param {boolean} props.isDragging - Indicates if files are currently being dragged over the drop zone. Controls visibility and animations.
 * @param {string} props.selectedModelId - The ID of the currently selected AI model, used to fetch supported file types.
 *
 * @returns {JSX.Element} The rendered overlay element.
 */
export function FileDropOverlay({
  isDragging,
  selectedModelId,
}: {
  isDragging: boolean;
  selectedModelId: string;
}) {
  const { extensions } = getSupportedFileTypes(selectedModelId);
  const { open: isSidebarOpen } = useSidebar();

  return (
    <div
      data-testid=\"file-drop-overlay\"
      className={cn(
        \"pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-all duration-500\",
        isDragging ? \"backdrop-blur-sm\" : \"pointer-events-none opacity-0\",
        isSidebarOpen ? \"left-[var(--sidebar-width)]\" : \"left-0\"
      )}
    >
      <div
        className={cn(
          \"absolute inset-0 bg-background/80 transition-opacity duration-400\",
          isDragging ? \"opacity-10\" : \"opacity-0\"
        )}
      />
      <div
        data-testid=\"drop-content\"
        className={cn(
          \"relative z-10 flex flex-col items-center gap-4 px-8 transition-all duration-200\",
          isDragging
            ? \"scale-100 opacity-100\"
            : \"pointer-events-none scale-95 opacity-0\"
        )}
      >
        <Image
          data-testid=\"drop-icon\"
          alt=\"Drop files here to add to your conversation\"
          height={120}
          src=\"/icons/folder-icon.svg\"
          width={120}
        />
        <div data-testid=\"drop-info\" className=\"flex flex-col items-center gap-4\">
          <h3 data-testid=\"drop-title\" className=\"font-semibold text-2xl\">Add Anything</h3>
          <div data-testid=\"supported-extensions\" className=\"flex flex-wrap justify-center gap-2\">
            {extensions.map((ext) => (
              <span
                key={ext}
                className=\"rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm\"
              >
                {ext}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
