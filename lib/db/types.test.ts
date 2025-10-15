import { describe, expect, it } from 'vitest';
import type { Gender, PersonalInformation, Personalization, Bio } from './types';

describe('DB Types', () => {
  describe('Gender', () => {
    it('should be a union of specific string literals', () => {
      expectTypeOf<Gender>().toEqualTypeOf<
        | 'Male'
        | 'Female'
        | 'Non-binary'
        | 'Prefer not to say'
        | 'Other'
      >();
    });

    it('should accept valid values', () => {
      const valid: Gender = 'Male';
      expect(valid).toBe('Male');
    });

    it('should reject invalid values at compile time', () => {
      // @ts-expect-error Invalid gender
      const invalid: Gender = 'Invalid' as any;
    });
  });

  describe('Bio', () => {
    it('should be a string', () => {
      expectTypeOf<Bio>().toEqualTypeOf<string>();
    });
  });

  describe('PersonalInformation', () => {
    it('should have optional string properties and optional Gender', () => {
      expectTypeOf<PersonalInformation>().toEqualTypeOf<{
        name?: string;
        email?: string;
        phone?: string;
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        gender?: Gender;
      }>();
    });
  });

  describe('Personalization', () => {
    it('should extend PersonalInformation with a required bio string', () => {
      expectTypeOf<Personalization>().toEqualTypeOf<
        PersonalInformation & {
          bio: string;
        }
      >();
    });

    it('should have all properties from PersonalInformation as optional except bio', () => {
      const personalization: Personalization = {
        bio: 'Test bio',
        // All others optional
      };
      expect(personalization.bio).toBe('Test bio');
    });
  });
});
