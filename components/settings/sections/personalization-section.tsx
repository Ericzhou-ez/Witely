"use client";

import { HelpCircle } from "lucide-react";
import { useCallback, useEffect, useReducer } from "react";
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

type PersonalInfoFields = {
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
};

type State = {
  isLoading: boolean;
  isSaving: boolean;
  isEditingPersonalInfo: boolean;
  isEditingBio: boolean;
  personalInfo: PersonalInfoFields;
  originalPersonalInfo: PersonalInfoFields;
  bio: string;
  originalBio: string;
};

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_EDITING_PERSONAL_INFO"; payload: boolean }
  | { type: "SET_EDITING_BIO"; payload: boolean }
  | {
      type: "UPDATE_PERSONAL_INFO_FIELD";
      field: keyof PersonalInfoFields;
      value: string;
    }
  | { type: "SET_PERSONAL_INFO"; payload: PersonalInfoFields }
  | { type: "SET_ORIGINAL_PERSONAL_INFO"; payload: PersonalInfoFields }
  | { type: "RESET_PERSONAL_INFO" }
  | { type: "UPDATE_BIO"; payload: string }
  | { type: "SET_ORIGINAL_BIO"; payload: string }
  | { type: "RESET_BIO" }
  | { type: "LOAD_PERSONALIZATION"; payload: Personalization };

const initialState: State = {
  isLoading: true,
  isSaving: false,
  isEditingPersonalInfo: false,
  isEditingBio: false,
  personalInfo: {
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
  },
  originalPersonalInfo: {
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
  },
  bio: "",
  originalBio: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "SET_EDITING_PERSONAL_INFO":
      return { ...state, isEditingPersonalInfo: action.payload };
    case "SET_EDITING_BIO":
      return { ...state, isEditingBio: action.payload };
    case "UPDATE_PERSONAL_INFO_FIELD":
      return {
        ...state,
        personalInfo: {
          ...state.personalInfo,
          [action.field]: action.value,
        },
      };
    case "SET_PERSONAL_INFO":
      return { ...state, personalInfo: action.payload };
    case "SET_ORIGINAL_PERSONAL_INFO":
      return { ...state, originalPersonalInfo: action.payload };
    case "RESET_PERSONAL_INFO":
      return {
        ...state,
        personalInfo: state.originalPersonalInfo,
        isEditingPersonalInfo: false,
      };
    case "UPDATE_BIO":
      return { ...state, bio: action.payload };
    case "SET_ORIGINAL_BIO":
      return { ...state, originalBio: action.payload };
    case "RESET_BIO":
      return {
        ...state,
        bio: state.originalBio,
        isEditingBio: false,
      };
    case "LOAD_PERSONALIZATION": {
      const personalInfoData: PersonalInfoFields = {
        name: action.payload.name || "",
        email: action.payload.email || "",
        phone: action.payload.phone || "",
        addressLine1: action.payload.addressLine1 || "",
        addressLine2: action.payload.addressLine2 || "",
        city: action.payload.city || "",
        state: action.payload.state || "",
        zipCode: action.payload.zipCode || "",
        country: action.payload.country || "",
        gender: action.payload.gender || "",
      };
      return {
        ...state,
        personalInfo: personalInfoData,
        originalPersonalInfo: personalInfoData,
        bio: action.payload.bio || "",
        originalBio: action.payload.bio || "",
        isLoading: false,
      };
    }
    default:
      return state;
  }
}

export function PersonalizationSection() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch personalization data on mount
  useEffect(() => {
    async function fetchPersonalization() {
      try {
        const response = await fetch("/api/personalization");

        if (!response.ok) {
          if (response.status === 404) {
            // No personalization data yet
            dispatch({ type: "SET_LOADING", payload: false });
            return;
          }
          throw new Error("Failed to fetch personalization data");
        }

        const data = await response.json();
        const personalization: Personalization = data.personalization;

        dispatch({ type: "LOAD_PERSONALIZATION", payload: personalization });
      } catch (error) {
        console.error("Error fetching personalization:", error);
        toast({
          type: "error",
          description: "Failed to load personalization data",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }

    fetchPersonalization();
  }, []);

  // Save personal information
  const handleSavePersonalInfo = useCallback(async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      // Only send changed fields
      const changes: Partial<PersonalInfoFields> = {};

      for (const key of Object.keys(state.personalInfo) as Array<
        keyof PersonalInfoFields
      >) {
        if (state.personalInfo[key] !== state.originalPersonalInfo[key]) {
          changes[key] = state.personalInfo[key];
        }
      }

      // If nothing changed, don't make the request
      if (Object.keys(changes).length === 0) {
        dispatch({ type: "SET_EDITING_PERSONAL_INFO", payload: false });
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
      dispatch({
        type: "SET_ORIGINAL_PERSONAL_INFO",
        payload: state.personalInfo,
      });

      toast({
        type: "success",
        description: "Personal information saved successfully",
      });
      dispatch({ type: "SET_EDITING_PERSONAL_INFO", payload: false });
    } catch (error) {
      console.error("Error saving personal info:", error);
      toast({
        type: "error",
        description: "Failed to save personal information",
      });
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state.personalInfo, state.originalPersonalInfo]);

  // Cancel personal info editing
  const handleCancelPersonalInfo = useCallback(() => {
    dispatch({ type: "RESET_PERSONAL_INFO" });
  }, []);

  // Save bio
  const handleSaveBio = useCallback(async () => {
    dispatch({ type: "SET_SAVING", payload: true });
    try {
      const response = await fetch("/api/personalization/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: state.bio }),
      });

      if (!response.ok) {
        throw new Error("Failed to save bio");
      }

      dispatch({ type: "SET_ORIGINAL_BIO", payload: state.bio });
      toast({
        type: "success",
        description: "Bio saved successfully",
      });
      dispatch({ type: "SET_EDITING_BIO", payload: false });
    } catch (error) {
      console.error("Error saving bio:", error);
      toast({
        type: "error",
        description: "An unexpected error occurred",
      });
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [state.bio]);

  // Cancel bio editing
  const handleCancelBio = useCallback(() => {
    dispatch({ type: "RESET_BIO" });
  }, []);

  // Edit personal info handler
  const handleEditPersonalInfo = useCallback(() => {
    dispatch({ type: "SET_EDITING_PERSONAL_INFO", payload: true });
  }, []);

  // Edit bio handler
  const handleEditBio = useCallback(() => {
    dispatch({ type: "SET_EDITING_BIO", payload: true });
  }, []);

  if (state.isLoading) {
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
        {state.isEditingPersonalInfo ? (
          <PersonalInfoEdit
            addressLine1={state.personalInfo.addressLine1}
            addressLine2={state.personalInfo.addressLine2}
            city={state.personalInfo.city}
            country={state.personalInfo.country}
            email={state.personalInfo.email}
            gender={state.personalInfo.gender}
            isSaving={state.isSaving}
            name={state.personalInfo.name}
            onAddressLine1Change={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "addressLine1",
                value,
              })
            }
            onAddressLine2Change={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "addressLine2",
                value,
              })
            }
            onCancel={handleCancelPersonalInfo}
            onCityChange={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "city",
                value,
              })
            }
            onCountryChange={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "country",
                value,
              })
            }
            onEmailChange={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "email",
                value,
              })
            }
            onGenderChange={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "gender",
                value,
              })
            }
            onNameChange={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "name",
                value,
              })
            }
            onPhoneChange={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "phone",
                value,
              })
            }
            onSave={handleSavePersonalInfo}
            onStateChange={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "state",
                value,
              })
            }
            onZipCodeChange={(value) =>
              dispatch({
                type: "UPDATE_PERSONAL_INFO_FIELD",
                field: "zipCode",
                value,
              })
            }
            phone={state.personalInfo.phone}
            state={state.personalInfo.state}
            zipCode={state.personalInfo.zipCode}
          />
        ) : (
          <PersonalInfoDisplay
            addressLine1={state.personalInfo.addressLine1}
            addressLine2={state.personalInfo.addressLine2}
            city={state.personalInfo.city}
            country={state.personalInfo.country}
            email={state.personalInfo.email}
            gender={state.personalInfo.gender}
            name={state.personalInfo.name}
            onEdit={handleEditPersonalInfo}
            phone={state.personalInfo.phone}
            state={state.personalInfo.state}
            zipCode={state.personalInfo.zipCode}
          />
        )}

        <div>
          {/* Bio Section */}
          {state.isEditingBio ? (
            <BioEdit
              bio={state.bio}
              isSaving={state.isSaving}
              onBioChange={(value) =>
                dispatch({ type: "UPDATE_BIO", payload: value })
              }
              onCancel={handleCancelBio}
              onSave={handleSaveBio}
            />
          ) : (
            <BioDisplay bio={state.bio} onEdit={handleEditBio} />
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
