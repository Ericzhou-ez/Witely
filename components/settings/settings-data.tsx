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

export type SettingsSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  isExternal?: boolean;
  externalPath?: string;
};

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
