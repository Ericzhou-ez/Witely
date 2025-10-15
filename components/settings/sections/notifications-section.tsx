"use client";

import Link from \"next/link\";
import { useState } from \"react\";
import { Label } from \"@/components/ui/label\";
import { Switch } from \"@/components/ui/switch\";

/**
 * NotificationsSection component for managing user notification preferences in the settings.
 * This component provides toggles for promotional emails and Witely tips notifications.
 * It uses local state to manage the toggle states and includes a link to the privacy policy.
 *
 * No props are accepted; all functionality is self-contained.
 *
 * @returns {JSX.Element} The rendered notifications section UI.
 */
export function NotificationsSection() {
  const [promotional, setPromotional] = useState<boolean>(true);
  const [witelyTips, setWitelyTips] = useState<boolean>(true);

  return (
    <div className=\"space-y-6\">
      <div className=\"space-y-4\">
        <div className=\"flex items-center justify-between gap-5\">
          <div className=\"space-y-1\">
            <Label className=\"font-normal text-base\" data-testid=\"promotional-label\">Promotional</Label>
            <p className=\"text-muted-foreground text-xs\">
              Receive emails about new features, updates, and special offers.
            </p>
          </div>
          <Switch data-testid=\"promotional-switch\" checked={promotional} onCheckedChange={setPromotional} />
        </div>

        <div className=\"flex items-center justify-between gap-5 pt-4\">
          <div className=\"space-y-1\">
            <Label className=\"font-normal text-base\" data-testid=\"witely-tips-label\">Witely Tips</Label>
            <p className=\"text-muted-foreground text-xs\">
              Get personalized suggestions, schedule summaries, weather updates,
              and things you need to do for the day.
            </p>
          </div>
          <Switch data-testid=\"witely-tips-switch\" checked={witelyTips} onCheckedChange={setWitelyTips} />
        </div>
      </div>

      <p className=\"text-muted-foreground text-sm\">
        You can learn more about Witely's privacy policy{\" \"} 
        <Link className=\"text-primary underline\" href=\"/privacy-policy\" data-testid=\"privacy-policy-link\">
          here
        </Link>
        .
      </p>
    </div>
  );
}
