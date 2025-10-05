"use client";

import {
  ExternalLink,
  HelpCircle,
  LogOut,
  Settings,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "./toast";

export function UserMenu() {
  const { status } = useSession();

  return (
    <>
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => {
          // Handle upgrade plan navigation
          window.location.href = "/upgrade";
        }}
      >
        <Sparkles className="mr-0.5 size-4" />
        <span>Upgrade plan</span>
      </DropdownMenuItem>

      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => {
          window.open("https://witely.com", "_blank");
        }}
      >
        <WandSparkles className="mr-0.5 size-4" />
        <span className="flex-1">Get witely</span>
        <ExternalLink className="ml-2 size-3.5 opacity-60" />
      </DropdownMenuItem>

      <DropdownMenuItem
        className="cursor-pointer"
        onClick={() => {
          window.open("https://help.witely.com", "_blank");
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
          // Handle settings navigation
          window.location.href = "/settings";
        }}
      >
        <Settings className="mr-0.5 size-4" />
        <span>Settings</span>
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
