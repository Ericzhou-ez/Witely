import { generateDummyPassword } from "./db/utils";

/**
 * Determines if the current environment is production.
 * 
 * @returns {boolean} True if the NODE_ENV environment variable is set to "production".
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Determines if the current environment is development.
 * 
 * @returns {boolean} True if the NODE_ENV environment variable is set to "development".
 */
export function isDevelopmentEnvironment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Determines if the current environment is a test environment, typically used with Playwright.
 * 
 * @returns {boolean} True if any of PLAYWRIGHT_TEST_BASE_URL, PLAYWRIGHT, or CI_PLAYWRIGHT environment variables are set.
 */
export function isTestEnvironment(): boolean {
  return Boolean(
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
  );
}

/**
 * A dummy password generated for testing and development purposes.
 * This should not be used in production.
 * 
 * @returns {string} A randomly generated password string.
 */
export const DUMMY_PASSWORD = generateDummyPassword();