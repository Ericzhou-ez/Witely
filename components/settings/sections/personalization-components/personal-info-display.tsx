import { Edit2 } from "lucide-react";
import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";

/**
 * Available gender options for personal information display and selection.
 * @type {Array<{value: string, label: string}>}
 */
export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
  { value: "Other", label: "Other" },
];

/**
 * A read-only display component for personal information, including name, email, phone, 
 * formatted address, and gender. Includes an edit button to trigger editing mode.
 * 
 * The address is automatically formatted by joining non-empty address fields with commas.
 * If no address is provided, displays "Not provided".
 * Gender is looked up from GENDER_OPTIONS for display label.
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - User's full name
 * @param {string} props.email - User's email address
 * @param {string} props.phone - User's phone number
 * @param {string} props.addressLine1 - First line of the address
 * @param {string} props.addressLine2 - Second line of the address (optional)
 * @param {string} props.city - City name
 * @param {string} props.state - State or province
 * @param {string} props.zipCode - ZIP or postal code
 * @param {string} props.country - Country name
 * @param {string} props.gender - Gender value (matches GENDER_OPTIONS.value)
 * @param {() => void} props.onEdit - Callback function to handle edit action
 */
function PersonalInfoDisplayComponent({
  name,
  email,
  phone,
  addressLine1,
  addressLine2,
  city,
  state,
  zipCode,
  country,
  gender,
  onEdit,
}: {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  gender: string;
  onEdit: () => void;
}) {
  // Combine all address fields into a single formatted address
  const formattedAddress = useMemo(() => {
    const addressParts = [
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
    ].filter((part) => part && part.trim() !== "");

    return addressParts.length > 0 ? addressParts.join(", ") : "Not provided";
  }, [addressLine1, addressLine2, city, state, zipCode, country]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-base" data-testid="personal-info-title">Personal Information</h3>
        <Button className="h-8 px-2" onClick={onEdit} size="sm" variant="ghost" data-testid="edit-personal-info">
          <Edit2 className="h-2 w-2" />
          Edit
        </Button>
      </div>

      <div className="space-y-3 rounded-xl bg-muted/30 p-4 shadow-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Full Name</span>
          <span className="font-medium" data-testid="personal-name">{name || "Not provided"}</span>
        </div>
        <div className="border-border/50 border-t" />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="font-medium" data-testid="personal-email">{email || "Not provided"}</span>
        </div>
        <div className="border-border/50 border-t" />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phone</span>
          <span className="font-medium" data-testid="personal-phone">{phone || "Not provided"}</span>
        </div>
        <div className="border-border/50 border-t" />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Address</span>
          <span className="max-w-[250px] text-right font-medium" data-testid="personal-address">
            {formattedAddress}
          </span>
        </div>
        <div className="border-border/50 border-t" />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gender</span>
          <span className="font-medium" data-testid="personal-gender">
            {gender
              ? GENDER_OPTIONS.find((option) => option.value === gender)
                  ?.label || "Not provided"
              : "Not provided"}
          </span>
        </div>
      </div>
    </div>
  );
}

const PersonalInfoDisplay = memo(PersonalInfoDisplayComponent);
PersonalInfoDisplay.displayName = "PersonalInfoDisplay";

export default PersonalInfoDisplay;
