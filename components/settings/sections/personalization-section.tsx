 "use client";

import { HelpCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Personalization } from "@/lib/db/types";
import BioDisplay from "./personalization-components/bio-display";
import BioEdit from "./personalization-components/bio-edit";
import PersonalInfoDisplay from "./personalization-components/personal-info-display";
import PersonalInfoEdit from "./personalization-components/personal-info-edit";

/**
 * PersonalizationSection component.
 * 
 * This component manages the user's personal information and bio settings.
 * It fetches existing data on mount, allows editing in separate modes for personal info and bio,
 * and handles saving changes to the backend API.
 * 
 * State includes loading, saving, edit modes, personal info fields, bio, and original values for change detection.
 * No external props.
 */
export function PersonalizationSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Consolidated personal info state
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    gender: "",
  });

  const [originalPersonalInfo, setOriginalPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    gender: "",
  });

  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);

  // Bio states
  const [bio, setBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Field updater for personal info
  const updateField = useCallback((
    field: keyof typeof personalInfo
  ) => (value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Extract current values for passing to components
  const {
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
  } = personalInfo;

  // Fetch personalization data on mount
  useEffect(() => {
    async function fetchPersonalization() {
      try {
        const response = await fetch("/api/personalization");

        if (!response.ok) {
          if (response.status === 404) {
            // No personalization data yet
            setIsLoading(false);
            return;
          }
          throw new Error("Failed to fetch personalization data");
        }

        const data = await response.json();
        const personalization: Personalization = data.personalization;

        // Set personal info
        const values = {
          name: personalization.name || "",
          email: personalization.email || "",
          phone: personalization.phone || "",
          addressLine1: personalization.addressLine1 || "",
          addressLine2: personalization.addressLine2 || "",
          city: personalization.city || "",
          state: personalization.state || "",
          zipCode: personalization.zipCode || "",
          country: personalization.country || "",
          gender: personalization.gender || "",
        };

        setPersonalInfo(values);
        setOriginalPersonalInfo(values);
        setBio(personalization.bio || "");
      } catch (error) {
        console.error("Error fetching personalization:", error);
        toast({
          type: "error",
          description: "Failed to load personalization data",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchPersonalization();
  }, []);

  // Extract changes for save
  /* Test point: Ensure only changed fields are included in the save payload */
  const getChanges = useCallback((
    current: typeof personalInfo,
    original: typeof originalPersonalInfo
  ) => {
    const changes: Partial<typeof personalInfo> = {};

    Object.entries(current).forEach(([key, value]) => {
      const typedKey = key as keyof typeof personalInfo;
      if (value !== original[typedKey]) {
        changes[typedKey] = value;
      }
    });

    return changes;
  }, []);

  // Save personal information
  const handleSavePersonalInfo = useCallback(async () => {
    setIsSaving(true);
    try {
      const changes = getChanges(personalInfo, originalPersonalInfo);

      // If nothing changed, don't make the request
      if (Object.keys(changes).length === 0) {
        setIsEditingPersonalInfo(false);
        return;
      }

      const response = await fetch(
        "/api/personalization/personal-information",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save personal information");
      }

      // Update original values to new values
      setOriginalPersonalInfo(personalInfo);

      toast({
        type: "success",
        description: "Personal information saved successfully",
      });
      setIsEditingPersonalInfo(false);
    } catch (error) {
      console.error("Error saving personal info:", error);
      toast({
        type: "error",
        description: "Failed to save personal information",
      });
    } finally {
      setIsSaving(false);
    }
  }, [personalInfo, originalPersonalInfo, getChanges]);

  // Cancel personal info editing
  const handleCancelPersonalInfo = useCallback(() => {
    setIsEditingPersonalInfo(false);
  }, []);

  // Save bio
  const handleSaveBio = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/personalization/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        throw new Error("Failed to save bio");
      }

      toast({
        type: "success",
        description: "Bio saved successfully",
      });
      setIsEditingBio(false);
    } catch (error) {
      console.error("Error saving bio:", error);
      toast({
        type: "error",
        description: "Failed to save bio",
      });
    } finally {
      setIsSaving(false);
    }
  }, [bio]);

  // Cancel bio editing
  const handleCancelBio = useCallback(() => {
    setIsEditingBio(false);
  }, []);

  // Edit personal info handler
  const handleEditPersonalInfo = useCallback(() => {
    setIsEditingPersonalInfo(true);
  }, []);

  // Edit bio handler
  const handleEditBio = useCallback(() => {
    setIsEditingBio(true);
  }, []);

  if (isLoading) {
    /* Test point: Loading skeleton should display while fetching data */
    return (
      <div className="space-y-16">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div data-testid="personalization-section" className="space-y-16">
        {/* Personal Information Section */}
        <section data-testid="personal-info-section">
          {isEditingPersonalInfo ? (
            <PersonalInfoEdit
              addressLine1={addressLine1}
              addressLine2={addressLine2}
              city={city}
              country={country}
              email={email}
              gender={gender}
              isSaving={isSaving}
              name={name}
              onAddressLine1Change={updateField("addressLine1")}
              onAddressLine2Change={updateField("addressLine2")}
              onCancel={handleCancelPersonalInfo}
              onCityChange={updateField("city")}
              onCountryChange={updateField("country")}
              onEmailChange={updateField("email")}
              onGenderChange={updateField("gender")}
              onNameChange={updateField("name")}
              onPhoneChange={updateField("phone")}
              onSave={handleSavePersonalInfo}
              onStateChange={updateField("state")}
              onZipCodeChange={updateField("zipCode")}
              phone={phone}
              state={state}
              zipCode={zipCode}
            />
          ) : (
            <PersonalInfoDisplay
              addressLine1={addressLine1}
              addressLine2={addressLine2}
              city={city}
              country={country}
              email={email}
              gender={gender}
              name={name}
              onEdit={handleEditPersonalInfo}
              phone={phone}
              state={state}
              zipCode={zipCode}
            />
          )}
        </section>

        <div>
          {/* Bio Section */}
          <section data-testid="bio-section">
            {isEditingBio ? (
              <BioEdit
                bio={bio}
                isSaving={isSaving}
                onBioChange={setBio}
                onCancel={handleCancelBio}
                onSave={handleSaveBio}
              />
            ) : (
              <BioDisplay bio={bio} onEdit={handleEditBio} />
            )}
          </section>

          {/* Disclaimer */}
          <div data-testid="personalization-disclaimer" className="mt-6 rounded-xl bg-destructive/20 p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        This information helps Witely provide more personalized
                        and tailored responses, and enables automatic form
                        filling when browsing to save you time.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="font-medium text-foreground text-sm">
                    Why does Witely need this information?
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  This information is only used by Witely to give better, more
                  tailored responses and for helping you autofill forms when
                  browsing. Your privacy is important to us.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
