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

export function PersonalizationSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Personal info states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);

  // Original values for tracking changes
  const [originalValues, setOriginalValues] = useState({
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

  // Bio states
  const [bio, setBio] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);

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

        setName(values.name);
        setEmail(values.email);
        setPhone(values.phone);
        setAddressLine1(values.addressLine1);
        setAddressLine2(values.addressLine2);
        setCity(values.city);
        setState(values.state);
        setZipCode(values.zipCode);
        setCountry(values.country);
        setGender(values.gender);
        setBio(personalization.bio || "");
        setOriginalBio(personalization.bio || "");

        // Store original values for comparison
        setOriginalValues(values);
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

  // Save personal information
  const handleSavePersonalInfo = useCallback(async () => {
    setIsSaving(true);
    try {
      // Only send changed fields
      const changes: Partial<typeof originalValues> = {};

      if (name !== originalValues.name) {
        changes.name = name;
      }
      if (email !== originalValues.email) {
        changes.email = email;
      }
      if (phone !== originalValues.phone) {
        changes.phone = phone;
      }
      if (addressLine1 !== originalValues.addressLine1) {
        changes.addressLine1 = addressLine1;
      }
      if (addressLine2 !== originalValues.addressLine2) {
        changes.addressLine2 = addressLine2;
      }
      if (city !== originalValues.city) {
        changes.city = city;
      }
      if (state !== originalValues.state) {
        changes.state = state;
      }
      if (zipCode !== originalValues.zipCode) {
        changes.zipCode = zipCode;
      }
      if (country !== originalValues.country) {
        changes.country = country;
      }
      if (gender !== originalValues.gender) {
        changes.gender = gender;
      }

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
      setOriginalValues({
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
      });

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
  }, [
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
    originalValues,
  ]);

  // Cancel personal info editing
  const handleCancelPersonalInfo = useCallback(() => {
    setName(originalValues.name);
    setEmail(originalValues.email);
    setPhone(originalValues.phone);
    setAddressLine1(originalValues.addressLine1);
    setAddressLine2(originalValues.addressLine2);
    setCity(originalValues.city);
    setState(originalValues.state);
    setZipCode(originalValues.zipCode);
    setCountry(originalValues.country);
    setGender(originalValues.gender);
    setIsEditingPersonalInfo(false);
  }, [originalValues]);

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

      setOriginalBio(bio);
      toast({
        type: "success",
        description: "Bio saved successfully",
      });
      setIsEditingBio(false);
    } catch (error) {
      console.error("Error saving bio:", error);
      toast({
        type: "error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  }, [bio]);

  // Cancel bio editing
  const handleCancelBio = useCallback(() => {
    setBio(originalBio);
    setIsEditingBio(false);
  }, [originalBio]);

  // Edit personal info handler
  const handleEditPersonalInfo = useCallback(() => {
    setIsEditingPersonalInfo(true);
  }, []);

  // Edit bio handler
  const handleEditBio = useCallback(() => {
    setIsEditingBio(true);
  }, []);

  if (isLoading) {
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
      <div className="space-y-16">
        {/* Personal Information Section */}
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
            onAddressLine1Change={setAddressLine1}
            onAddressLine2Change={setAddressLine2}
            onCancel={handleCancelPersonalInfo}
            onCityChange={setCity}
            onCountryChange={setCountry}
            onEmailChange={setEmail}
            onGenderChange={setGender}
            onNameChange={setName}
            onPhoneChange={setPhone}
            onSave={handleSavePersonalInfo}
            onStateChange={setState}
            onZipCodeChange={setZipCode}
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

        <div>
          {/* Bio Section */}
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

          {/* Disclaimer */}
          <div className="mt-6 rounded-xl bg-destructive/20 p-4 shadow-sm">
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
