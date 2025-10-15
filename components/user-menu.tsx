"use client";

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

export function UserMenu() {
  const { status } = useSession();
  const router = useRouter();
  const { open: openSettings } = useSettingsModal();

  return (
    <>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => {
          // Handle upgrade plan navigation
          router.push("/upgrade");
        }}
      >
        <Sparkles className="mr-0.5 size-4" />
        <span>Upgrade plan</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => {
          window.open("https://witely.ai", "_blank");
        }}
      >
        <WandSparkles className="mr-0.5 size-4" />
        <span className="flex-1">Get witely</span>
        <ExternalLink className="ml-2 size-3.5 opacity-60" />
      </DropdownMenuItem>

      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => {
          window.open("https://help.witely.ai", "_blank");
        }}
      >
        <HelpCircle className="mr-0.5 size-4" />
        <span className="flex-1">Help Center</span>
        <ExternalLink className="ml-2 size-3.5 opacity-60" />
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => {
          openSettings();
        }}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="mr-0.5 size-4" />
            <span>Settings</span>
          </div>
          <KbdGroup>
            <Kbd>⌘,</Kbd>
          </KbdGroup>
        </div>
      </DropdownMenuItem>

      <DropdownMenuItem
        className="cursor-pointer"
        data-testid="user-nav-item-auth"
        onClick={() => {
          if (status === "loading") {
            toast({
              type: "error",
              description: "Checking authentication status, please try again!",
            });
            return;
          }
          signOut({
            redirectTo: "/",
          });
        }}
      >
        <LogOut className="mr-0.5 size-4" />
        <span>Logout</span>
      </DropdownMenuItem>
    </>
  );
}
