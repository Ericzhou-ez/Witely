"use client";

import { ChevronLeft, ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AccountSection } from "./sections/account-section";
import { AppsSection } from "./sections/apps-section";
import { GeneralSection } from "./sections/general-section";
import { NotificationsSection } from "./sections/notifications-section";
import { PersonalizationSection } from "./sections/personalization-section";
import { SecuritySection } from "./sections/security-section";
import { type SettingsSection, settingsSections } from "./settings-data";

type SettingsMobileLayoutProps = {
  onClose: () => void;
};

export function SettingsMobileLayout({ onClose }: SettingsMobileLayoutProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const router = useRouter();

  const handleSectionClick = (section: SettingsSection) => {
    if (section.isExternal && section.externalPath) {
      onClose();
      router.push(section.externalPath);
    } else {
      setActiveSection(section.id);
    }
  };

  /**\n * Handles back navigation from a section to the main list.\n */\nconst handleBack = () => {
    setActiveSection(null);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return <GeneralSection />;
      case "notifications":
        return <NotificationsSection />;
      case "personalization":
        return <PersonalizationSection />;
      case "apps":
        return <AppsSection />;
      case "security":
        return <SecuritySection />;
      case "account":
        return <AccountSection />;
      default:
        return null;
    }
  };

  const activeSectionData = settingsSections.find(
    (s) => s.id === activeSection
  );

  return (
    <div className="fixed inset-4 flex flex-col rounded-2xl bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        {activeSection ? (
          <>
            <Button
              className="size-8"
              onClick={handleBack}
              size="icon"
              variant="ghost"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <h2 className="flex-1 text-center font-semibold text-base">
              {activeSectionData?.label}
            </h2>
            <div className="size-8" /> {/* Spacer for alignment */}
          </>
        ) : (
          <>
            <h2 className="font-semibold text-base">Settings</h2>
            <Button
              className="size-8"
              onClick={onClose}
              size="icon"
              variant="ghost"
            >
              <X className="size-5" />
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection ? (
          // Active section content
          <div className="p-4">{renderSection()}</div>
        ) : (
          // Section list
          <div className="divide-y">
            {settingsSections.map((section) => (
              <button
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors active:bg-accent"
                key={section.id}
                onClick={() => handleSectionClick(section)}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <section.icon className="size-5 text-muted-foreground" />
                  <span className="font-medium">{section.label}</span>
                </div>
                {section.isExternal ? (
                  <ExternalLink className="size-4 opacity-60" />
                ) : (
                  <ChevronLeft className="size-5 rotate-180 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
/button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
