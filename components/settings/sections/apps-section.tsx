"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const connectedApps = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync your calendar events and schedule",
    connected: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications and updates to Slack",
    connected: false,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Export and sync your notes with Notion",
    connected: true,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Connect your GitHub repositories",
    connected: false,
  },
];

export function AppsSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Label className="font-normal text-base">Connected apps</Label>
        <p className="text-muted-foreground text-sm">
          Manage your connected applications and services.
        </p>
      </div>

      <div className="space-y-3">
        {connectedApps.map((app) => (
          <div
            className="flex items-center justify-between rounded-lg border p-4"
            key={app.id}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{app.name}</span>
                {app.connected && (
                  <Badge className="text-xs" variant="secondary">
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{app.description}</p>
            </div>
            <Button
              onClick={() => {
                // Handle connect/disconnect
              }}
              size="sm"
              variant={app.connected ? "outline" : "default"}
            >
              {app.connected ? "Disconnect" : "Connect"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
