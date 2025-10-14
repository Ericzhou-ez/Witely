export type Gender =
  | "Male"
  | "Female"
  | "Non-binary"
  | "Prefer not to say"
  | "Other";

export type PersonalInformation = {
  name: string | undefined;
  email: string | undefined;
  phone: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  city: string | undefined;
  state: string | undefined;
  zipCode: string | undefined;
  country: string | undefined;
  gender: Gender | undefined;
};

type Bio = string;

export type Personalization = PersonalInformation & { bio: Bio };
