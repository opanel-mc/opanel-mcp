import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendDeleteRequest, sendGetRequest, sendPostRequest } from "../helper.js";

export const getCodeOfConducts = defineTool({
  name: "get_code_of_conducts",
  description: "Get the list of code of conducts currently available on the Minecraft server.",
  input: {},
  output: {
    codeOfConducts: z
      .record(z.string(), z.string())
      .describe("The list of code of conducts currently available on the Minecraft server.")
  },
  handler: async () => {
    return await sendGetRequest<{ codeOfConducts: Record<string, string> }>("/api/control/code-of-conduct");
  },
});

export const changeCodeOfConduct = defineTool({
  name: "change_code_of_conduct_content",
  description: "Change the content of a code of conduct on the Minecraft server.",
  input: {
    lang: z
      .string()
      .describe("The language of the code of conduct to change the content of. e.g. en_us, zh_cn."),
    content: z
      .string()
      .describe("The new content of the code of conduct.")
  },
  output: {},
  handler: async ({ lang, content }) => {
    await sendPostRequest(`/api/control/code-of-conduct?lang=${lang}`, content);
    return {};
  }
});

export const removeCodeOfConduct = defineTool({
  name: "remove_code_of_conduct",
  description: "Remove a code of conduct from the Minecraft server.",
  input: {
    lang: z
      .string()
      .describe("The language of the code of conduct to remove. e.g. en_us, zh_cn.")
  },
  output: {},
  handler: async ({ lang }) => {
    await sendDeleteRequest(`/api/control/code-of-conduct?lang=${lang}`);
    return {};
  }
});
