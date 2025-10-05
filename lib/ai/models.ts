export type ChatModel = {
  id: string;
  name: string;
  model: string;
  model_detail?: string;
  description: string;
  search: boolean;

  vision: boolean;
  pdf_understanding: boolean;
  reasoning: boolean;

  pinned: boolean;
};

export const MODEL_PROVIDER_IDS = {
  // Google Gemini
  GEMINI_2_5_FLASH_LITE: "google/gemini-2.5-flash-lite",
  GEMINI_2_5_FLASH: "google/gemini-2.5-flash",
  GEMINI_2_5_PRO: "google/gemini-2.5-pro",

  // Open ai
  GPT_5: "openai/gpt-5",
  GPT_5_MINI: "openai/gpt-5-mini",
  // GPT_5_REASONING: "",
  GPT_4o: "openai/gpt-4o",
  GPT_4o_MINI: "openai/gpt-4o-mini",
  GPT_OSS_120: "openai/gpt-oss-120b",
  GPT_OSS_20: "openai/gpt-oss-20b",

  // deep seek
  DEEP_SEEK_V3_1: "deepseek/deepseek-v3.1",
  DEEP_SEEK_V3: "deepseek/deepseek-v3",
  DEEP_SEEK_r1: "deepseek/deepseek-r1",

  // Grok
  GROK_4: "xai/grok-4",
  GROK_4_FAST: "xai/grok-4-fast-non-reasoning",
  GROK_4_FAST_REASONING: "xai/grok-4-fast-reasoning",

  // Anthropic
  CLAUDE_3_7_SONNET: "anthropic/claude-3.7-sonnet",
  CLAUDE_4_SONNET: "anthropic/claude-sonnet-4",
  CLAUDE_4_5_SONNET: "anthropic/claude-sonnet-4.5",
};

export const ALL_MODEL_IDS: string[] = Object.values(MODEL_PROVIDER_IDS);

export const DEFAULT_CHAT_MODEL: string =
  MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH_LITE;

export const chatModels: ChatModel[] = [
  // --- Google Gemini Models ---
  {
    id: MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH_LITE,
    name: "Gemini",
    model: "2.5 Flash Lite",
    description: "Google's most lightweight and fastest model.",
    search: true,
    vision: true,
    pdf_understanding: true,
    reasoning: false,
    pinned: false,
  },
  {
    id: MODEL_PROVIDER_IDS.GEMINI_2_5_FLASH,
    name: "Gemini",
    model: "2.5 Flash",
    description: "A fast and cost-efficient model for general tasks.",
    search: true,
    vision: true,
    pdf_understanding: true,
    reasoning: false,
    pinned: true,
  },
  {
    id: MODEL_PROVIDER_IDS.GEMINI_2_5_PRO,
    name: "Gemini",
    model: "2.5 Pro",
    description: "Google's most capable and versatile model.",
    search: true,
    vision: true,
    pdf_understanding: true,
    reasoning: true,
    pinned: false,
  },

  // --- OpenAI Models ---
  {
    id: MODEL_PROVIDER_IDS.GPT_5,
    name: "GPT",
    model: "5",
    description: "OpenAI's next-generation frontier model (hypothetical).",
    search: true,
    vision: true,
    pdf_understanding: true,
    reasoning: true,
    pinned: false,
  },
  {
    id: MODEL_PROVIDER_IDS.GPT_5_MINI,
    name: "GPT",
    model: "5 Mini",
    description: "A smaller, faster version of the GPT-5 architecture.",
    search: true,
    vision: true,
    pdf_understanding: true,
    reasoning: true,
    pinned: false,
  },
  {
    id: MODEL_PROVIDER_IDS.GPT_4o,
    name: "GPT",
    model: "4o",
    description:
      "OpenAI's current flagship multimodal model, optimized for speed.",
    search: true,
    vision: true,
    pdf_understanding: false,
    reasoning: false,
    pinned: true,
  },
  {
    id: MODEL_PROVIDER_IDS.GPT_4o_MINI,
    name: "GPT",
    model: "4o Mini",
    description: "A highly efficient version of GPT-4o for everyday tasks.",
    search: true,
    vision: true,
    pdf_understanding: false,
    reasoning: false,
    pinned: false,
  },
  {
    id: MODEL_PROVIDER_IDS.GPT_OSS_120,
    name: "GPT-OSS",
    model: "120B",
    description: "Large open-source model from OpenAI, good for research.",
    search: true,
    vision: false,
    pdf_understanding: false,
    reasoning: true,
    pinned: false,
  },
  {
    id: MODEL_PROVIDER_IDS.GPT_OSS_20,
    name: "GPT-OSS",
    model: "20B",
    description: "Smaller open-source model, good for local or fine-tuning.",
    search: true,
    vision: false,
    pdf_understanding: false,
    reasoning: true,
    pinned: true,
  },

  // --- DeepSeek Models ---
  {
    id: MODEL_PROVIDER_IDS.DEEP_SEEK_V3_1,
    name: "DeepSeek",
    model: "v3.1",
    description: "A powerful model specializing in code and mathematics.",
    search: true,
    vision: false,
    pdf_understanding: true,
    reasoning: true,
    pinned: false,
  },
  {
    id: MODEL_PROVIDER_IDS.DEEP_SEEK_V3,
    name: "DeepSeek",
    model: "v3",
    description: "Previous generation DeepSeek coding and math expert.",
    search: true,
    vision: false,
    pdf_understanding: false,
    reasoning: false,
    pinned: true,
  },
  {
    id: MODEL_PROVIDER_IDS.DEEP_SEEK_r1,
    name: "DeepSeek",
    model: "r1",
    description: "DeepSeek's research-focused experimental model.",
    search: true,
    vision: false,
    pdf_understanding: false,
    reasoning: true,
    pinned: false,
  },

  // --- Grok Models ---
  {
    id: MODEL_PROVIDER_IDS.GROK_4,
    name: "Grok",
    model: "4",
    description: "xAI's flagship real-time, general intelligence model.",
    search: true,
    vision: true,
    pdf_understanding: true,
    reasoning: true,
    pinned: false,
  },
  {
    id: MODEL_PROVIDER_IDS.GROK_4_FAST,
    name: "Grok",
    model: "4 Fast",
    description: "A speed-optimized Grok model for rapid responses.",
    search: true,
    vision: true,
    pdf_understanding: false,
    reasoning: false,
    pinned: true,
  },
  {
    id: MODEL_PROVIDER_IDS.GROK_4_FAST_REASONING,
    name: "Grok",
    model: "4 Fast",
    model_detail: "(reasoning)",
    description: "Grok 4 Fast with enhanced chain-of-thought capabilities.",
    search: true,
    vision: true,
    pdf_understanding: false,
    reasoning: true,
    pinned: false,
  },

  // --- Anthropic Models ---
  {
    id: MODEL_PROVIDER_IDS.CLAUDE_3_7_SONNET,
    name: "Claude",
    model: "3.7 Sonnet",
    description:
      "Anthropic's latest balanced model, strong with documents and reasoning.",
    search: true,
    vision: true,
    pdf_understanding: true,
    reasoning: true,
    pinned: false,
  },
  {
    id: MODEL_PROVIDER_IDS.CLAUDE_4_SONNET,
    name: "Claude",
    model: "4 Sonnet",
    description: "Anthropic's flagship coding model",
    search: true,
    vision: true,
    pdf_understanding: true,
    reasoning: true,
    pinned: false,
  },
  {
    id: MODEL_PROVIDER_IDS.CLAUDE_4_5_SONNET,
    name: "Claude",
    model: "4.5 Sonnet",
    description: "Anthropic's flagship coding model",
    search: true,
    vision: true,
    pdf_understanding: true,
    reasoning: true,
    pinned: false,
  },
];
