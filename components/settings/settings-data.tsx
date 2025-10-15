import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Database,
  Palette,
  Puzzle,
  Settings,
  Shield,
  User,
} from "lucide-react";

/**
 * Type for settings sections in the settings page.
 */
export type SettingsSection = {
  /** Unique ID for the section */
  id: string;
  /** Display label for the section */
  label: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Whether the section is external (links to another page) */
  isExternal?: boolean;
  /** External path if isExternal is true */
  externalPath?: string;
};

/**
 * Array of settings sections for the settings page.
 * Includes internal and external sections.
 */
export const settingsSections: SettingsSection[] = [
  {
    id: "general",
    label: "General",
    icon: Settings,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "personalization",
    label: "Personalization",
    icon: Palette,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Puzzle,
    isExternal: true,
    externalPath: "/integrations",
  },
  {
    id: "data-control",
    label: "Data controls",
    icon: Database,
    isExternal: true,
    externalPath: "/data-control",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
  },
  {
    id: "account",
    label: "Account",
    icon: User,
  },
];
