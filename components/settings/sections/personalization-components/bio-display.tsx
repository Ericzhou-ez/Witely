import { Edit2 } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";

function BioDisplayComponent({
  bio,
  onEdit,
}: {
  bio: string;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-base">Bio</h3>
        <Button className="h-8 px-2" onClick={onEdit} size="sm" variant="ghost">
          <Edit2 className="h-2 w-2" />
          Edit
        </Button>
      </div>

      <div className="rounded-xl bg-muted/30 p-4 shadow-sm">
        <span className="max-w-[300px] text-left">
          {bio || "Tell Witely about yourself"}
        </span>
      </div>
    </div>
  );
}

const BioDisplay = memo(BioDisplayComponent);
BioDisplay.displayName = "BioDisplay";

export default BioDisplay;
