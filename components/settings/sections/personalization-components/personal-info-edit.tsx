import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GENDER_OPTIONS } from "./personal-info-display";

/**
 * Memoized reusable input field with label and optional description.
 *
 * @param {Object} props - Props for the input field
 * @param {string} props.id - The ID for the input
 * @param {string} props.label - The label text
 * @param {string} props.value - The current value
 * @param {(value: string) => void} props.onChange - Handler for value changes
 * @param {string} props.placeholder - Placeholder text
 * @param {string} [props.type] - Input type (default: text)
 * @param {string} [props.description] - Optional description
 * @returns {JSX.Element} The input field component
 */
const InputField = memo(
  ({
    id,
    label,
    value,
    onChange,
    placeholder,
    type,
    description,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
    description?: string;
  }) => (
    <div className="space-y-2">
      <Label className="font-normal text-muted-foreground text-sm" htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        data-testid={`personal-info-input-${id}`}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {description && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}
    </div>
  )
);
InputField.displayName = "InputField";

/**
 * Memoized select component for gender options.
 *
 * @param {Object} props - Props for the gender select
 * @param {string} props.value - Current gender value
 * @param {(value: string) => void} props.onChange - Change handler
 * @returns {JSX.Element} The select component
 */
const GenderSelect = memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <Label
        className="font-normal text-muted-foreground text-sm"
        htmlFor="gender"
      >
        Gender
      </Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger data-testid="personal-info-gender-select">
          <SelectValue placeholder="Select your gender" />
        </SelectTrigger>
        <SelectContent>
          {GENDER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
);
GenderSelect.displayName = "GenderSelect";

/**
 * Memoized buttons for save and cancel actions.
 *
 * @param {Object} props - Props for action buttons
 * @param {() => void} props.onSave - Save action handler
 * @param {() => void} props.onCancel - Cancel action handler
 * @param {boolean} [props.isSaving] - Saving state
 * @returns {JSX.Element} The buttons JSX
 */
const ActionButtons = memo(
  ({
    onSave,
    onCancel,
    isSaving,
  }: {
    onSave: () => void;
    onCancel: () => void;
    isSaving?: boolean;
  }) => (
    <div className="flex gap-2 pt-2">
      <Button data-testid="personal-info-save-btn" disabled={isSaving} onClick={onSave} size="sm">
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
      <Button
        data-testid="personal-info-cancel-btn"
        disabled={isSaving}
        onClick={onCancel}
        size="sm"
        variant="outline"
      >
        Cancel
      </Button>
    </div>
  )
);
ActionButtons.displayName = "ActionButtons";

/**
 * Component for editing user's personal information.
 *
 * @param {Object} props - The props object
 * @param {string} props.name - User's full name
 * @param {string} props.email - User's email
 * @param {string} props.phone - User's phone number
 * @param {string} props.addressLine1 - Address line 1
 * @param {string} props.addressLine2 - Address line 2
 * @param {string} props.city - City
 * @param {string} props.state - State or province
 * @param {string} props.zipCode - ZIP or postal code
 * @param {string} props.country - Country or region
 * @param {string} props.gender - Gender selection
 * @param {() => void} props.onSave - Save handler
 * @param {() => void} props.onCancel - Cancel handler
 * @param {(value: string) => void} props.onNameChange - Name change handler
 * @param {(value: string) => void} props.onEmailChange - Email change handler
 * @param {(value: string) => void} props.onPhoneChange - Phone change handler
 * @param {(value: string) => void} props.onAddressLine1Change - Address line 1 change handler
 * @param {(value: string) => void} props.onAddressLine2Change - Address line 2 change handler
 * @param {(value: string) => void} props.onCityChange - City change handler
 * @param {(value: string) => void} props.onStateChange - State change handler
 * @param {(value: string) => void} props.onZipCodeChange - ZIP change handler
 * @param {(value: string) => void} props.onCountryChange - Country change handler
 * @param {(value: string) => void} props.onGenderChange - Gender change handler
 * @param {boolean} [props.isSaving] - Whether saving is in progress
 * @returns {JSX.Element} The edit form JSX element
 */
function PersonalInfoEditComponent({
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
  onSave,
  onCancel,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onAddressLine1Change,
  onAddressLine2Change,
  onCityChange,
  onStateChange,
  onZipCodeChange,
  onCountryChange,
  onGenderChange,
  isSaving,
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
  onSave: () => void;
  onCancel: () => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAddressLine1Change: (value: string) => void;
  onAddressLine2Change: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  isSaving?: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-base">Edit Personal Information</h3>

      <div className="space-y-4">
        <InputField
          id="name"
          label="Full Name (required)"
          onChange={onNameChange}
          placeholder="Enter your full name"
          value={name}
        />

        <InputField
          id="email"
          label="Email"
          onChange={onEmailChange}
          placeholder="Enter your email address"
          type="email"
          value={email}
        />

        <InputField
          id="phone"
          label="Phone"
          onChange={onPhoneChange}
          placeholder="Enter your phone number"
          type="tel"
          value={phone}
        />

        <div className="space-y-4">
          <InputField
            description="Street address, P.O. box, etc."
            id="address-line-1"
            label="Address Line 1"
            onChange={onAddressLine1Change}
            placeholder="Street address, P.O. box, etc."
            value={addressLine1}
          />

          <InputField
            description="Apartment, suite, building, floor, etc."
            id="address-line-2"
            label="Address Line 2"
            onChange={onAddressLine2Change}
            placeholder="Apartment, suite, building, floor, etc."
            value={addressLine2}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="city"
              label="City"
              onChange={onCityChange}
              placeholder="Enter city"
              value={city}
            />

            <InputField
              id="state"
              label="State or Province"
              onChange={onStateChange}
              placeholder="Enter state or province"
              value={state}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="zip-code"
              label="ZIP or Postal Code"
              onChange={onZipCodeChange}
              placeholder="Enter ZIP or postal code"
              value={zipCode}
            />

            <InputField
              id="country"
              label="Country or Region"
              onChange={onCountryChange}
              placeholder="Enter country or region"
              value={country}
            />
          </div>
        </div>

        <GenderSelect onChange={onGenderChange} value={gender} />
      </div>

      <ActionButtons isSaving={isSaving} onCancel={onCancel} onSave={onSave} />
    </div>
  );
}

const PersonalInfoEdit = memo(PersonalInfoEditComponent);
PersonalInfoEdit.displayName = "PersonalInfoEdit";

export default PersonalInfoEdit;
