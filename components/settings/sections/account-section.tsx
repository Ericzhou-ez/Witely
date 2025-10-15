"use client";

import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";

export function AccountSection() {
  const { user, isLoading } = useUser();
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyUUID = async () => {
    if (user?.id) {
      await navigator.clipboard.writeText(user?.id ?? "");
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="flex items-center justify-between gap-4">
        {isLoading ? (
          <>
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3.5 w-48" />
              </div>
            </div>
            <Skeleton className="size-4" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarImage
                  src={
                    user?.profileURL ||
                    `https://avatar.vercel.sh/${user?.email}` ||
                    undefined
                  }
                />
                <AvatarFallback className="text-lg">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <p className="font-medium text-base">{user?.name || "User"}</p>
                <p className="text-muted-foreground text-sm">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            <button
              aria-label="Copy user ID"
              className="text-muted-foreground transition-colors hover:text-foreground"
              onClick={handleCopyUUID}
              type="button"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Account Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pt-2">
          <Label className="font-normal text-base">Account type</Label>
          {isLoading ? (
            <Skeleton className="h-4 w-16" />
          ) : (
            <p className="text-muted-foreground text-sm">
              {user?.type
                ? user.type.charAt(0).toUpperCase() + user.type.slice(1)
                : "Free"}
            </p>
          )}
        </div>

        {/* <div className="flex items-center justify-between pt-2">
          <Label className="font-normal text-base">Account created</Label>
          <p className="text-muted-foreground text-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            )}
          </p>
        </div> */}

        <div className="flex items-center justify-between gap-5 pt-4">
          <div className="space-y-1">
            <Label className="font-normal text-base">Manage account data</Label>
            <p className="text-muted-foreground text-xs">
              Control your personal information and export your data.
            </p>
          </div>
          <Button
            onClick={() => {
              router.push("/data-controls");
            }}
            size="sm"
            variant="outline"
          >
            Manage
          </Button>
        </div>

        <div className="flex items-center justify-between gap-5 pt-4">
          <div className="space-y-1">
            <Label className="font-normal text-base">Shared links</Label>
            <p className="text-muted-foreground text-xs">
              View and manage all your shared conversation links.
            </p>
          </div>
          <Button
            onClick={() => {
              // Handle shared links navigation
            }}
            size="sm"
            variant="outline"
          >
            View
          </Button>
        </div>

        <div className="flex items-center justify-between gap-5 pt-4">
          <div className="space-y-1">
            <Label className="font-normal text-base">
              Delete all account data
            </Label>
            <p className="text-muted-foreground text-xs">
              Permanently remove all your account data. This action cannot be
              undone.
            </p>
          </div>
          <Button
            className="border-destructive text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              // Handle delete all account data
            }}
            size="sm"
            variant="outline"
          >
            Delete
          </Button>
        </div>

        <div className="flex items-center justify-between gap-5 pt-4">
          <div className="space-y-1">
            <Label className="font-normal text-base">Delete account</Label>
            <p className="text-muted-foreground text-xs">
              Permanently removes your account and all your data, including your
              subscription. This action cannot be undone. Read the full
              side-effects{" "}
              <Link className="text-primary underline" href="/privacy-policy">
                here
              </Link>{" "}
              before deleting your account.
            </p>
          </div>
          <Button
            onClick={() => {
              // Handle delete account
            }}
            size="sm"
            variant="destructive"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
