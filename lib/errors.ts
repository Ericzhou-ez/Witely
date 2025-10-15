/**
 * Types and classes for handling errors in the Witely application.
 * Defines standard error codes, surfaces, and custom error classes for consistent error management.
 */

/**
 * Possible error types that can occur in the application.
 */
export type ErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "offline";

/**
 * Surfaces or contexts where errors can occur in the application.
 */
export type Surface =
  | "chat"
  | "auth"
  | "api"
  | "stream"
  | "database"
  | "history"
  | "vote"
  | "document"
  | "suggestions"
  | "activate_gateway"
  | "personalization";

/**
 * Combined error code in the format `${ErrorType}:${Surface}`.
 * Used to identify specific error scenarios.
 */
export type ErrorCode = `${ErrorType}:${Surface}`;

/**
 * Visibility levels for how errors are handled in responses or logs.
 * - "response": Include details in API response.
 * - "log": Log details, return generic message.
 * - "none": No special handling.
 */
export type ErrorVisibility = "response" | "log" | "none";

/**
 * Mapping of surfaces to their default error visibility levels.
 * This determines whether error details are exposed to the client or just logged internally.
 */
export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  database: "log",
  chat: "response",
  auth: "response",
  stream: "response",
  api: "response",
  history: "response",
  vote: "response",
  document: "response",
  suggestions: "response",
  activate_gateway: "response",
  personalization: "response",
};

/**
 * Custom error class for Chat SDK related errors.
 * Extends the built-in Error class and provides additional structure for error types, surfaces, and HTTP status codes.
 * Used for errors originating from chat functionalities.
 */
export class ChatSDKError extends Error {
  /**
   * The type of the error (e.g., "not_found").
   */
  type: ErrorType;

  /**
   * The surface or context where the error occurred (e.g., "chat").
   */
  surface: Surface;

  /**
   * The HTTP status code associated with this error type.
   */
  statusCode: number;

  /**
   * Optional detailed cause of the error.
   */
  cause?: string;

  /**
   * Constructs a new ChatSDKError instance.
   *
   * @param errorCode - The error code in the format "type:surface" (e.g., "not_found:chat").
   * @param cause - Optional string providing more details about the error cause.
   */
  constructor(errorCode: ErrorCode, cause?: string) {
    super();

    const [type, surface] = errorCode.split(":");

    this.type = type as ErrorType;
    this.cause = cause;
    this.surface = surface as Surface;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(this.type);
  }

  /**
   * Converts this error into a Response object suitable for returning in API endpoints.
   * The response format depends on the visibility setting for the surface.
   *
   * @returns A Response object with JSON body and appropriate status code.
   */
  toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityBySurface[this.surface];

    const { message, cause, statusCode } = this;

    if (visibility === "log") {
      console.error({
        code,
        message,
        cause,
      });

      return Response.json(
        { code: "", message: "Something went wrong. Please try again later." },
        { status: statusCode }
      );
    }

    return Response.json({ code, message, cause }, { status: statusCode });
  }
}

/**
 * Custom error class for general Witely application errors.
 * Similar to ChatSDKError but used for non-chat specific errors.
 * Extends the built-in Error class with structured error handling.
 */
export class WitelyError extends Error {
  /**
   * The type of the error (e.g., "bad_request").
   */
  type: ErrorType;

  /**
   * The surface or context where the error occurred (e.g., "api").
   */
  surface: Surface;

  /**
   * The HTTP status code associated with this error type.
   */
  statusCode: number;

  /**
   * Optional detailed cause of the error.
   */
  cause?: string;

  /**
   * Constructs a new WitelyError instance.
   *
   * @param errorCode - The error code in the format "type:surface" (e.g., "bad_request:api").
   * @param cause - Optional string providing more details about the error cause.
   */
  constructor(errorCode: ErrorCode, cause?: string) {
    super();

    const [type, surface] = errorCode.split(":");

    this.type = type as ErrorType;
    this.cause = cause;
    this.surface = surface as Surface;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(this.type);
  }

  /**
   * Converts this error into a Response object suitable for returning in API endpoints.
   * The response format depends on the visibility setting for the surface.
   *
   * @returns A Response object with JSON body and appropriate status code.
   */
  toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityBySurface[this.surface];

    const { message, cause, statusCode } = this;

    if (visibility === "log") {
      console.error({
        code,
        message,
        cause,
      });

      return Response.json(
        { code: "", message: "Something went wrong. Please try again later." },
        { status: statusCode }
      );
    }

    return Response.json({ code, message, cause }, { status: statusCode });
  }
}

/**
 * Retrieves a user-friendly error message based on the provided error code.
 * Messages are tailored to specific error types and surfaces for better user experience.
 *
 * @param errorCode - The error code in the format "type:surface".
 * @returns A string containing the appropriate error message.
 */
export function getMessageByErrorCode(errorCode: ErrorCode): string {
  if (errorCode.includes("database")) {
    return "An error occurred while executing a database query.";
  }

  switch (errorCode) {
    case "bad_request:api":
      return "The request couldn't be processed. Please check your input and try again.";

    case "bad_request:activate_gateway":
      return "AI Gateway requires a valid credit card on file to service requests. Please visit https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card to add a card and unlock your free credits.";

    case "unauthorized:auth":
      return "You need to sign in before continuing.";
    case "forbidden:auth":
      return "Your account does not have access to this feature.";

    case "rate_limit:chat":
      return "You have exceeded your maximum number of messages for the day. Please try again later.";
    case "not_found:chat":
      return "The requested chat was not found. Please check the chat ID and try again.";
    case "forbidden:chat":
      return "This chat belongs to another user. Please check the chat ID and try again.";
    case "unauthorized:chat":
      return "You need to sign in to view this chat. Please sign in and try again.";
    case "offline:chat":
      return "We're having trouble sending your message. Please check your internet connection and try again.";

    case "not_found:document":
      return "The requested document was not found. Please check the document ID and try again.";
    case "forbidden:document":
      return "This document belongs to another user. Please check the document ID and try again.";
    case "unauthorized:document":
      return "You need to sign in to view this document. Please sign in and try again.";
    case "bad_request:document":
      return "The request to create or update the document was invalid. Please check your input and try again.";

    default:
      return "Something went wrong. Please try again later.";
  }
}

/**
 * Internal function to map error types to their corresponding HTTP status codes.
 * Used by error constructors to set the statusCode property.
 *
 * @param type - The error type.
 * @returns The appropriate HTTP status code.
 */
function getStatusCodeByType(type: ErrorType) {
  switch (type) {
    case "bad_request":
      return 400;
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "rate_limit":
      return 429;
    case "offline":
      return 503;
    default:
      return 500;
  }
}

/**
 * Example usage and test scenarios for the error classes.
 * These can be used to write unit tests to verify error construction and response generation.
 *
 * // Example 1: Creating a ChatSDKError
 * const chatError = new ChatSDKError("not_found:chat", "Invalid chat ID provided");
 * console.log(chatError.message); // "The requested chat was not found. Please check the chat ID and try again."
 * console.log(chatError.statusCode); // 404
 * const response = chatError.toResponse();
 * // Assert: response.status === 404
 * // Assert: response.headers.get('Content-Type') === 'application/json'
 *
 * // Example 2: Creating a WitelyError for API
 * const apiError = new WitelyError("bad_request:api", "Missing required field");
 * console.log(apiError.message); // "The request couldn't be processed. Please check your input and try again."
 * const apiResponse = apiError.toResponse();
 * // Assert: apiResponse.status === 400
 * // Assert: JSON.parse(await apiResponse.text()).code === "bad_request:api"
 *
 * // Example 3: Database error (logged, generic response)
 * const dbError = new WitelyError("bad_request:database", "Query failed");
 * const dbResponse = dbError.toResponse();
 * // Assert: dbResponse.status === 400
 * // Assert: JSON.parse(await dbResponse.text()).message === "Something went wrong. Please try again later."
 * // And check console.error was called with details
 */
