import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function BioEditComponent({
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
        <Textarea
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
