"use client";

import { ExternalLink, Maximize2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSettingsModal } from "@/hooks/use-settings-modal";
import { cn } from "@/lib/utils";
import { AccountSection } from "./sections/account-section";
import { GeneralSection } from "./sections/general-section";
import { NotificationsSection } from "./sections/notifications-section";
import { PersonalizationSection } from "./sections/personalization-section";
import { SecuritySection } from "./sections/security-section";
import { type SettingsSection, settingsSections } from "./settings-data";

type SettingsDesktopLayoutProps = {
  onClose: () => void;
};

/**
 * Desktop layout component for the settings interface.
 * Provides a sidebar navigation for different settings sections and renders the selected section in the main content area.
 * Supports external links for certain sections and handles modal expansion.
 *
 * @param {SettingsDesktopLayoutProps} props - The component props.
 * @param {() => void} props.onClose - Function to call when the user wants to close the settings modal.
 * @returns {JSX.Element} The rendered settings desktop layout component.
 */
export function SettingsDesktopLayout({ onClose }: SettingsDesktopLayoutProps) {
  const [activeSection, setActiveSection] = useState("general");
  const { isExpanded, toggleExpanded } = useSettingsModal();
  const router = useRouter();

  const handleSectionClick = (section: SettingsSection) => {
    if (section.isExternal && section.externalPath) {
      onClose();
      router.push(section.externalPath);
    } else {
      setActiveSection(section.id);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSection />;
      case "notifications":
        return <NotificationsSection />;
      case "personalization":
        return <PersonalizationSection />;
      case "security":
        return <SecuritySection />;
      case "account":
        return <AccountSection />;
      default:
        return <GeneralSection />;
    }
  };

  const activeSectionData = settingsSections.find(
    (s) => s.id === activeSection
  );

  return (
    <div
      className={cn(
        "relative flex overflow-hidden rounded-2xl border border-muted bg-background shadow-2xl transition-all duration-300",
        isExpanded
          ? "!max-w-[90vw] !max-h-[80vh] h-[800px] w-[1000px]"
          : "!max-w-[90vw] !max-h-[80vh] h-[550px] w-[700px]"
      )}
    >
      <div
        className={cn(
          "absolute top-1 left-1 z-10 flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-200",
          "bg-black/5 opacity-100 backdrop-blur-sm dark:bg-white/10"
        )}
      >
        <button
          className="flex size-3 cursor-pointer items-center justify-center rounded-full bg-gray-300 transition-all duration-200 hover:bg-red-500 dark:bg-gray-700 dark:hover:bg-red-500"
          onClick={onClose}
          type="button"
        >
          <X className="size-1.5 text-transparent transition-colors hover:text-white" />
        </button>
        <button
          className="flex size-3 cursor-pointer items-center justify-center rounded-full bg-gray-300 transition-all duration-200 hover:bg-green-500 dark:bg-gray-700 dark:hover:bg-green-500"
          onClick={toggleExpanded}
          type="button"
        >
          <Maximize2 className="size-1.5 text-transparent transition-colors hover:text-white" />
        </button>
      </div>
      {/* Sidebar */}
      <div className="border-r bg-muted/30 px-2 pt-15">
        <div className="space-y-1">
          {settingsSections.map((section) => (
            <button
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                activeSection === section.id && !section.isExternal
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
              key={section.id}
              onClick={() => handleSectionClick(section)}
              type="button"
            >
              <div className="flex items-center gap-3">
                <section.icon className="size-4" />
                <span>{section.label}</span>
              </div>
              {section.isExternal && (
                <ExternalLink className="size-3.5 opacity-60" />
              )}
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="font-semibold text-2xl">
              {activeSectionData?.label}
            </h2>
          </div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
