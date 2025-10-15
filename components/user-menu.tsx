"use client";

import { useCallback } from "react";
import {
  ExternalLink,
  HelpCircle,
  LogOut,
  Settings,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSettingsModal } from "@/hooks/use-settings-modal";
import { toast } from "./toast";
import { Kbd, KbdGroup } from "./ui/kbd";

/**
 * Renders the user menu dropdown items for the application.
 * Includes options for upgrading the plan, visiting the Witely website,
 * accessing the help center, opening settings, and logging out.
 *
 * This component assumes it's used within a DropdownMenuContent.
 *
 * @component
 * @returns {JSX.Element} The JSX elements for the user menu items.
 */
export function UserMenu() {
  const { status } = useSession();
  const router = useRouter();
  const { open: openSettings } = useSettingsModal();

  const handleUpgrade = useCallback(() => {
    router.push("/upgrade");
  }, [router]);

  const handleOpenWitely = useCallback(() => {
    window.open("https://witely.ai", "_blank");
  }, []);

  const handleOpenHelp = useCallback(() => {
    window.open("https://help.witely.ai", "_blank");
  }, []);

  const handleSettings = useCallback(() => {
    openSettings();
  }, [openSettings]);

  const handleLogout = useCallback(async () => {
    if (status === \"loading\") {
      toast({
        type: \"error\",
        description: \"Checking authentication status, please try again!\",
      });
      return;
    }

    try {
      await signOut({
        redirectTo: \"/\",
      });
    } catch (error) {
      toast({
        type: \"error\",
        description: \"Logout failed, please try again.\",
      });
    }
  }, [status]);

  return (
    <>
      <DropdownMenuItem
        className=\"cursor-pointer\"
        data-testid=\"user-menu-upgrade\"
        onClick={handleUpgrade}
      >
        <Sparkles className=\"mr-0.5 size-4\" />
        <span>Upgrade plan</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        className=\"cursor-pointer\"
        data-testid=\"user-menu-witely\"
        onClick={handleOpenWitely}
      >
        <WandSparkles className=\"mr-0.5 size-4\" />
        <span className=\"flex-1\">Get witely</span>
        <ExternalLink className=\"ml-2 size-3.5 opacity-60\" />
      </DropdownMenuItem>

      <DropdownMenuItem
        className=\"cursor-pointer\"
        data-testid=\"user-menu-help\"
        onClick={handleOpenHelp}
      >
        <HelpCircle className=\"mr-0.5 size-4\" />
        <span className=\"flex-1\">Help Center</span>
        <ExternalLink className=\"ml-2 size-3.5 opacity-60\" />
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className=\"cursor-pointer\"
        data-testid=\"user-menu-settings\"
        onClick={handleSettings}
      >
        <div className=\"flex w-full items-center justify-between\">
          <div className=\"flex items-center gap-2\">
            <Settings className=\"mr-0.5 size-4\" />
            <span>Settings</span>
          </div>
          <KbdGroup>
            <Kbd>⌘,</Kbd>
          </KbdGroup>
        </div>
      </DropdownMenuItem>

      <DropdownMenuItem
        className=\"cursor-pointer\"
        data-testid=\"user-menu-logout\"
        onClick={handleLogout}
      >
        <LogOut className=\"mr-0.5 size-4\" />
        <span>Logout</span>
      </DropdownMenuItem>
    </>
  );
}
