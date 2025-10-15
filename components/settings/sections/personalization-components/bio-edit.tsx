import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**\n * A component for editing the user's bio in the personalization settings.\n *\n * @param {Object} props - The component props.\n * @param {string} props.bio - The current bio text.\n * @param {() => void} props.onSave - Callback to save the bio changes.\n * @param {() => void} props.onCancel - Callback to cancel the edit.\n * @param {(value: string) => void} props.onBioChange - Callback when bio text changes.\n * @param {boolean} [props.isSaving] - Whether the save is in progress.\n *\n * @returns {JSX.Element} The bio edit form.\n */\nfunction BioEditComponent({
  bio,
  onSave,
  onCancel,
  onBioChange,
  isSaving,
}: {
  bio: string;
  onSave: () => void;
  onCancel: () => void;
  onBioChange: (value: string) => void;
  isSaving?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="font-medium text-base" htmlFor="bio">
          Bio
        </Label>
        <Textarea data-testid="bio-textarea"
          className="mt-4 resize-none"
          id="bio"
          maxLength={500}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Tell us about yourself"
          rows={4}
          value={bio}
        />
        <p className="mt-0.5 text-muted-foreground text-sm">
          A brief description about yourself (max 500 characters).
        </p>
      </div>

      <div className="flex gap-2 pt-2">
        <Button disabled={isSaving} onClick={onSave} size="sm">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          disabled={isSaving}
          onClick={onCancel}
          size="sm"
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

const BioEdit = memo(BioEditComponent);
BioEdit.displayName = "BioEdit";

export default BioEdit;
