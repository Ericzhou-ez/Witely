"use client";

import { Key, LogOut, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function SecuritySection() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-5 rounded-lg border p-4 shadow-sm">
          <div className="flex items-start gap-5">
            <Key className="mt-1 size-5 text-muted-foreground" />
            <div className="space-y-1">
              <Label className="font-normal text-base">Change password</Label>
              <p className="text-muted-foreground text-xs">
                Update your password to keep your account secure.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            Change
          </Button>
        </div>

        {/* <div className="flex items-center justify-between gap-5 rounded-lg border p-4 shadow-sm">
          <div className="flex items-start gap-5">
            <Smartphone className="mt-1 size-5 text-muted-foreground" />
            <div className="space-y-1">
              <Label className="font-normal text-base">
                Two-factor authentication
              </Label>
              <p className="text-muted-foreground text-xs">
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>
          <Button
            className="min-w-[80px]"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            size="sm"
            variant={twoFactorEnabled ? "default" : "outline"}
          >
            {twoFactorEnabled ? "Enabled" : "Enable"}
          </Button>
        </div> */}

        <div className="flex items-center justify-between gap-5 rounded-lg border p-4 shadow-sm">
          <div className="flex items-start gap-5">
            <Shield className="mt-1 size-5 text-muted-foreground" />
            <div className="space-y-1">
              <Label className="font-normal text-base">Active sessions</Label>
              <p className="text-muted-foreground text-xs">
                Manage and monitor your active sessions across devices.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            View
          </Button>
        </div>

        <div className="flex items-center justify-between gap-5 rounded-lg border bg-destructive/10 p-4 shadow-sm">
          <div className="flex items-start gap-5">
            <LogOut className="mt-1 size-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label className="font-normal text-base">Logout</Label>
              <p className="text-muted-foreground text-xs">
                Logout of your account on this device.
              </p>
            </div>
          </div>
          <Button
            onClick={() => signOut({ redirectTo: "/login" })}
            size="sm"
            variant="default"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
