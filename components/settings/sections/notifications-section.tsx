"use client";

import Link from "next/link";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function NotificationsSection() {
  const [promotional, setPromotional] = useState(true);
  const [witelyTips, setWitelyTips] = useState(true);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-5">
          <div className="space-y-1">
            <Label className="font-normal text-base">Promotional</Label>
            <p className="text-muted-foreground text-xs">
              Receive emails about new features, updates, and special offers.
            </p>
          </div>
          <Switch checked={promotional} onCheckedChange={setPromotional} />
        </div>

        <div className="flex items-center justify-between gap-5 pt-4">
          <div className="space-y-1">
            <Label className="font-normal text-base">Witely Tips</Label>
            <p className="text-muted-foreground text-xs">
              Get personalized suggestions, schedule summaries, weather updates,
              and things you need to do for the day.
            </p>
          </div>
          <Switch checked={witelyTips} onCheckedChange={setWitelyTips} />
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        You can learn more about Witely's privacy policy{" "}
        <Link className="text-primary underline" href="/privacy-policy">
          here
        </Link>
        .
      </p>
    </div>
  );
}
