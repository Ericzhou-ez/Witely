export type Gender =
  | "Male"
  | "Female"
  | "Non-binary"
  | "Prefer not to say"
  | "Other";

export type PersonalInformation = {
  name: string;
  email: string;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  gender: Gender | null;
};

type Bio = string;

export type Personalization = PersonalInformation & { bio: Bio };
