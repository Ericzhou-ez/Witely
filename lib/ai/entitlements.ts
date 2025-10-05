import type { UserType } from "@/app/(auth)/auth";
import type { ChatModel } from "./models";
import { MODEL_PROVIDER_IDS } from "./models";

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModel["id"][];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * TODO: entitlement based on credits, not max msg / day
   * Signing in via Credentials will be dev
   * Signing in via OAuth will be plus
   */

  free: {
    maxMessagesPerDay: 10,
    availableChatModelIds: [
      MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH_LITE,
      MODEL_PROVIDER_IDS.GPT_OSS_20,
    ],
  },

  plus: {
    maxMessagesPerDay: 50,
    availableChatModelIds: [
      // include all free models
      MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH_LITE,
      MODEL_PROVIDER_IDS.GPT_OSS_20,

      // plus-only extras
      MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH,
      MODEL_PROVIDER_IDS.GPT_4o,
      MODEL_PROVIDER_IDS.GPT_4o_MINI,
      MODEL_PROVIDER_IDS.GPT_OSS_120,
      MODEL_PROVIDER_IDS.DEEP_SEEK_V3_1,
      MODEL_PROVIDER_IDS.DEEP_SEEK_V3,
    ],
  },

  pro: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      // all models
      MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH_LITE,
      MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH,
      MODEL_PROVIDER_IDS.GEMINI_2_5_PRO,
      MODEL_PROVIDER_IDS.GPT_5,
      MODEL_PROVIDER_IDS.GPT_5_MINI,
      MODEL_PROVIDER_IDS.GPT_4o,
      MODEL_PROVIDER_IDS.GPT_4o_MINI,
      MODEL_PROVIDER_IDS.GPT_OSS_120,
      MODEL_PROVIDER_IDS.GPT_OSS_20,
      MODEL_PROVIDER_IDS.DEEP_SEEK_V3_1,
      MODEL_PROVIDER_IDS.DEEP_SEEK_V3,
      MODEL_PROVIDER_IDS.DEEP_SEEK_r1,
      MODEL_PROVIDER_IDS.GROK_4,
      MODEL_PROVIDER_IDS.GROK_4_FAST,
      MODEL_PROVIDER_IDS.GROK_4_FAST_REASONING,
      MODEL_PROVIDER_IDS.CLAUDE_3_7_SONNET,
      MODEL_PROVIDER_IDS.CLAUDE_4_SONNET,
      MODEL_PROVIDER_IDS.CLAUDE_4_5_SONNET,
    ],
  },

  ultra: {
    maxMessagesPerDay: 200,
    availableChatModelIds: [
      // all models
      MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH_LITE,
      MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH,
      MODEL_PROVIDER_IDS.GEMINI_2_5_PRO,
      MODEL_PROVIDER_IDS.GPT_5,
      MODEL_PROVIDER_IDS.GPT_5_MINI,
      MODEL_PROVIDER_IDS.GPT_4o,
      MODEL_PROVIDER_IDS.GPT_4o_MINI,
      MODEL_PROVIDER_IDS.GPT_OSS_120,
      MODEL_PROVIDER_IDS.GPT_OSS_20,
      MODEL_PROVIDER_IDS.DEEP_SEEK_V3_1,
      MODEL_PROVIDER_IDS.DEEP_SEEK_V3,
      MODEL_PROVIDER_IDS.DEEP_SEEK_r1,
      MODEL_PROVIDER_IDS.GROK_4,
      MODEL_PROVIDER_IDS.GROK_4_FAST,
      MODEL_PROVIDER_IDS.GROK_4_FAST_REASONING,
      MODEL_PROVIDER_IDS.CLAUDE_3_7_SONNET,
      MODEL_PROVIDER_IDS.CLAUDE_4_SONNET,
      MODEL_PROVIDER_IDS.CLAUDE_4_5_SONNET,
    ],
  },

  /*
   * For devs | for development only
   */
  dev: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: [
      // all models
      MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH_LITE,
      MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH,
      MODEL_PROVIDER_IDS.GEMINI_2_5_PRO,
      MODEL_PROVIDER_IDS.GPT_5,
      MODEL_PROVIDER_IDS.GPT_5_MINI,
      MODEL_PROVIDER_IDS.GPT_4o,
      MODEL_PROVIDER_IDS.GPT_4o_MINI,
      MODEL_PROVIDER_IDS.GPT_OSS_120,
      MODEL_PROVIDER_IDS.GPT_OSS_20,
      MODEL_PROVIDER_IDS.DEEP_SEEK_V3_1,
      MODEL_PROVIDER_IDS.DEEP_SEEK_V3,
      MODEL_PROVIDER_IDS.DEEP_SEEK_r1,
      MODEL_PROVIDER_IDS.GROK_4,
      MODEL_PROVIDER_IDS.GROK_4_FAST,
      MODEL_PROVIDER_IDS.GROK_4_FAST_REASONING,
      MODEL_PROVIDER_IDS.CLAUDE_3_7_SONNET,
      MODEL_PROVIDER_IDS.CLAUDE_4_SONNET,
      MODEL_PROVIDER_IDS.CLAUDE_4_5_SONNET,
    ],
  },
};
