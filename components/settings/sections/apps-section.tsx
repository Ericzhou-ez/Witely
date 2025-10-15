"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface App {
  /**
   * Unique identifier for the app.
   */
  id: string;
  /**
   * Display name of the app.
   */
  name: string;
  /**
   * Brief description of the app's functionality.
   */
  description: string;
  /**
   * Whether the app is currently connected.
   */
  connected: boolean;
}

const connectedApps: App[] = [
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

/**
 * AppsSection component displays a list of connected applications in the settings.
 * It shows app names, descriptions, connection status, and connect/disconnect buttons.
 * 
 * @returns {JSX.Element} The rendered AppsSection component.
 */
export function AppsSection(): JSX.Element {
  return (
    <div className="space-y-6" data-testid="apps-section">
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
            data-testid={`app-item-${app.id}`}
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
              data-testid={`app-button-${app.id}`}
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
