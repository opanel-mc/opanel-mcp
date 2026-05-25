import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendGetRequest, sendPatchRequest } from "../helper.js";

export const getGamerules = defineTool({
  name: "get_gamerules",
  description: "Get the current gamerules of the Minecraft server.",
  input: {
    dimension: z
      .enum(["overworld", "nether", "the_end"])
      .describe("The world dimension."),
  },
  output: {
    gamerules: z
      .record(
        z.string(),
        z.union([z.string(), z.number(), z.boolean()])
      )
      .describe("The current gamerules of the Minecraft server. The keys are the names of the gamerules, and the values are the values of the gamerules."),
  },
  handler: async ({ dimension }) => {
    return await sendGetRequest<{ gamerules: Record<string, string> }>(`/api/gamerules/${dimension}`);
  }
});

export const setGamerule = defineTool({
  name: "set_gamerule",
  description: "Set a gamerule of the Minecraft server.",
  input: {
    dimension: z
      .enum(["overworld", "nether", "the_end"])
      .describe("The world dimension."),
    key: z
      .string()
      .describe("The key of the gamerule to set."),
    value: z
      .string()
      .describe("The value to set for the gamerule.")
  },
  output: {},
  handler: async ({ dimension, key, value }) => {
    await sendPatchRequest(`/api/gamerules/${dimension}?key=${key}&value=${value}`);
    return {};
  }
});
