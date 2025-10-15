"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettingsModal } from "@/hooks/use-settings-modal";
import { SettingsDesktopLayout } from "./settings/settings-desktop-layout";
import { SettingsMobileLayout } from "./settings/settings-mobile-layout";

export function SettingsModal() {
  const { isOpen, close } = useSettingsModal();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + , to open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        useSettingsModal.getState().toggle();
      }
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Glassmorphic overlay */}
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/5 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={close}
            transition={{ duration: 0.2 }}
          />

          {/* Modal content */}
          <div className="pointer-events-none fixed inset-0 z-[50] flex items-center justify-center p-4">
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="pointer-events-auto"
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {isMobile ? (
                <SettingsMobileLayout onClose={close} />
              ) : (
                <SettingsDesktopLayout onClose={close} />
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
