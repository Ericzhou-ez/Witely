import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";
import { chatModels } from "./models";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : (() => {
      const languageModels: Record<string, any> = {};

      for (const m of chatModels) {
        if (m.reasoning) {
          languageModels[m.id] = wrapLanguageModel({
            model: gateway.languageModel(m.id),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
          });
        } else {
          languageModels[m.id] = gateway.languageModel(m.id);
        }
      }

      languageModels["title-model"] = gateway.languageModel("xai/grok-2-1212");
      languageModels["artifact-model"] =
        gateway.languageModel("xai/grok-2-1212"); //TODO: pick artifact based on user type

      return customProvider({
        languageModels,
      });
    })();
