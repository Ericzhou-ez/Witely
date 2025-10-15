/**
 * Enum representing the possible gender identities for user personalization.
 * This type is used to standardize gender options in user profiles.
 */
export type Gender =
  | "Male"
  | "Female"
  | "Non-binary"
  | "Prefer not to say"
  | "Other";

/**
 * Interface for basic personal information fields.
 * All fields are optional to support partial data and gradual profile completion.
 * Used in user personalization for contact and demographic details.
 */
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

/**
 * Type for user's biographical information.
 * A free-form string allowing users to describe themselves.
 */
type Bio = string;

/**
 * Combined type for full user personalization data.
 * Extends PersonalInformation with a bio field for comprehensive profile information.
 */
export type Personalization = PersonalInformation & { bio: Bio };

// Type assertion examples for verifying type safety (these compile-time checks ensure type correctness)
/* 
const validGender: Gender = "Male"; // ok
const invalidGender: Gender = "Invalid"; // TypeScript error: Type '"Invalid"' is not assignable to type 'Gender'

// Valid PersonalInformation
const validPersonal: PersonalInformation = {
  name: "John Doe",
  email: "john@example.com",
  gender: "Male"
}; // ok

// Partial is allowed
const partialPersonal: PersonalInformation = {
  name: "Jane"
}; // ok

// Invalid: wrong type for name
// const invalidPersonal: PersonalInformation = {
//   name: 123
// }; // TypeScript error

// Valid Personalization
const validPersonalization: Personalization = {
  ...validPersonal,
  bio: "Software engineer passionate about AI."
}; // ok

// Missing bio would error if not extended properly, but since & , bio is required
// const missingBio: Personalization = validPersonal; // TypeScript error: missing bio
*/
