"use client";

import { Check, Copy } from \"lucide-react\";
import Link from \"next/link\";
import { useRouter } from \"next/navigation\";
import { useSession } from \"next-auth/react\";
import { useEffect, useState } from \"react\";
import { toast } from \"@/components/toast\";
import { Avatar, AvatarFallback, AvatarImage } from \"@/components/ui/avatar\";
import { Button } from \"@/components/ui/button\";
import { Label } from \"@/components/ui/label\";
import { Skeleton } from \"@/components/ui/skeleton\";
import { useUser } from \"@/hooks/use-user\";

/**
 * AccountSection component for displaying user account information and management options.
 * 
 * This component renders the user's profile avatar and details, account type, and provides
 * buttons for managing account data, viewing shared links, deleting data, and deleting the account.
 * It handles loading states and clipboard copying of the user ID.
 * 
 * @returns {JSX.Element} The account section UI.
 */
export function AccountSection() {
  const { data: session } = useSession();
  const { user, isLoading } = useUser();
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopyUUID = async () => {
    if (session?.user?.id) {
      try {
        await navigator.clipboard.writeText(user?.id ?? \"\");
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 3000);
      } catch (error) {
        toast({ type: \"error\", description: \"Failed to copy user ID to clipboard.\" });
      }
    }
  };

  useEffect(() => {
    if (copied && user?.id) {
      toast({ type: \"success\", description: \"Copied user uuid to clipboard!\" });
    }
  }, [copied, user?.id]);

  return (
    <div className=\"space-y-8\" data-testid=\"account-section\">
      {/* Profile Section */}
      <UserProfile
        user={user}
        session={session}
        isLoading={isLoading}
        copied={copied}
        onCopy={handleCopyUUID}
      />

      {/* Account Settings */}
      <div className=\"space-y-4\" data-testid=\"account-settings\">
        <div className=\"flex items-center justify-between pt-2\" data-testid=\"account-type-row\">
          <Label className=\"font-normal text-base\">Account type</Label>
          {isLoading ? (
            <Skeleton className=\"h-4 w-16\" />
          ) : (
            <p className=\"text-muted-foreground text-sm\">
              {user?.type
                ? user.type.charAt(0).toUpperCase() + user.type.slice(1)
                : \"Free\"}
            </p>
          )}
        </div>

        {/* <div className=\"flex items-center justify-between pt-2\">
          <Label className=\"font-normal text-base\">Account created</Label>
          <p className=\"text-muted-foreground text-sm\">
            {isLoading ? (
              <Skeleton className=\"h-4 w-16\" />
            ) : (
              new Date().toLocaleDateString(\"en-US\", {
                month: \"long\",
                day: \"numeric\",
                year: \"numeric\",
              })
            )}
          </p>
        </div> */}

        <div className=\"flex items-center justify-between gap-5 pt-4\" data-testid=\"manage-data-row\">
          <div className=\"space-y-1\">
            <Label className=\"font-normal text-base\">Manage account data</Label>
            <p className=\"text-muted-foreground text-xs\">
              Control your personal information and export your data.
            </p>
          </div>
          <Button
            onClick={() => {
              router.push(\"/data-controls\");
            }}
            size=\"sm\"
            variant=\"outline\"
            data-testid=\"manage-data-button\"
          >
            Manage
          </Button>
        </div>

        <div className=\"flex items-center justify-between gap-5 pt-4\" data-testid=\"shared-links-row\">
          <div className=\"space-y-1\">
            <Label className=\"font-normal text-base\">Shared links</Label>
            <p className=\"text-muted-foreground text-xs\">
              View and manage all your shared conversation links.
            </p>
          </div>
          <Button
            onClick={() => {
              // Handle shared links navigation
            }}
            size=\"sm\"
            variant=\"outline\"
            data-testid=\"shared-links-button\"
          >
            View
          </Button>
        </div>

        <div className=\"flex items-center justify-between gap-5 pt-4\" data-testid=\"delete-data-row\">
          <div className=\"space-y-1\">
            <Label className=\"font-normal text-base\">
              Delete all account data
            </Label>
            <p className=\"text-muted-foreground text-xs\">
              Permanently remove all your account data. This action cannot be
              undone.
            </p>
          </div>
          <Button
            className=\"border-destructive text-destructive/80 hover:bg-destructive/10 hover:text-destructive\"
            onClick={() => {
              // Handle delete all account data
            }}
            size=\"sm\"
            variant=\"outline\"
            data-testid=\"delete-data-button\"
          >
            Delete
          </Button>
        </div>

        <div className=\"flex items-center justify-between gap-5 pt-4\" data-testid=\"delete-account-row\">
          <div className=\"space-y-1\">
            <Label className=\"font-normal text-base\">Delete account</Label>
            <p className=\"text-muted-foreground text-xs\">
              Permanently removes your account and all your data, including your
              subscription. This action cannot be undone. Read the full
              side-effects{\" \"}
              <Link className=\"text-primary underline\" href=\"/privacy-policy\">
                here
              </Link>{\" \"}
              before deleting your account.
            </p>
          </div>
          <Button
            onClick={() => {
              // Handle delete account
            }}
            size=\"sm\"
            variant=\"destructive\"
            data-testid=\"delete-account-button\"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

interface UserProfileProps {
  user: ReturnType<typeof useUser>['user'] | undefined;
  session: ReturnType<typeof useSession>['data'] | null;
  isLoading: boolean;
  copied: boolean;
  onCopy: () => void;
}

/**
 * Sub-component for rendering the user profile section, including avatar, name, email, and copy UUID button.
 * Handles loading state with skeletons.
 * 
 * @param {UserProfileProps} props - Component props.
 * @returns {JSX.Element} The user profile UI.
 */
function UserProfile({ user, session, isLoading, copied, onCopy }: UserProfileProps) {
  return (
    <div className=\"flex items-center justify-between gap-4\" data-testid=\"profile-section\">
      {isLoading ? (
        <>
          <div className=\"flex items-center gap-4\" data-testid=\"profile-skeleton\">
            <Skeleton className=\"size-16 rounded-full\" />
            <div className=\"flex flex-col gap-2\">
              <Skeleton className=\"h-4 w-32\" />
              <Skeleton className=\"h-3.5 w-48\" />
            </div>
          </div>
          <Skeleton className=\"size-4\" data-testid=\"copy-button-skeleton\" />
        </>
      ) : (
        <>
          <div className=\"flex items-center gap-4\" data-testid=\"user-profile\">
            <Avatar className=\"size-16\">
              <AvatarImage
                src={
                  user?.profileURL ||
                  session?.user?.image ||
                  `https://avatar.vercel.sh/${user?.email}` ||
                  undefined
                }
              />
              <AvatarFallback className=\"text-lg\">
                {user?.name?.[0]?.toUpperCase() || \"U\"}
              </AvatarFallback>
            </Avatar>
            <div className=\"flex flex-col gap-0.5\">
              <p className=\"font-medium text-base\">{user?.name || \"User\"}</p>
              <p className=\"text-muted-foreground text-sm\">
                {user?.email || \"user@example.com\"}
              </p>
            </div>
          </div>
          <button
            aria-label=\"Copy user ID\"
            className=\"text-muted-foreground transition-colors hover:text-foreground\"
            onClick={onCopy}
            type=\"button\"
            data-testid=\"copy-uuid-button\"
          >
            {copied ? (
              <Check className=\"size-4\" />
            ) : (
              <Copy className=\"size-4\" />
            )}
          </button>
        </>
      )}
    </div>
  );
}
"