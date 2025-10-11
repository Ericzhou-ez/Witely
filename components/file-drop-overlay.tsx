"use client";

import Image from "next/image";
import { getSupportedFileTypes } from "@/lib/ai/file-compatibility";
import { cn } from "@/lib/utils";
import { useSidebar } from "./ui/sidebar";

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
      className={cn(
        "pointer-events-none fixed inset-0 z-50 flex items-center justify-center transition-all duration-500",
        isDragging ? "backdrop-blur-sm" : "pointer-events-none opacity-0",
        isSidebarOpen ? "left-[var(--sidebar-width)]" : "left-0"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-background/80 transition-opacity duration-400",
          isDragging ? "opacity-10" : "opacity-0"
        )}
      />

      <div
        className={cn(
          "relative z-10 flex flex-col items-center gap-4 px-8 transition-all duration-200",
          isDragging
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <Image
          alt="Drop files"
          height={120}
          src="/icons/folder-icon.svg"
          width={120}
        />

        <div className="flex flex-col items-center gap-4">
          <h3 className="font-semibold text-2xl">Add Anything</h3>

          <div className="flex flex-wrap justify-center gap-2">
            {extensions.map((ext) => (
              <span
                className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm"
                key={ext}
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
