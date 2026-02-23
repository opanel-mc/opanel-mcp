import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendDeleteRequest, sendGetRequest, sendPatchRequest, sendPostRequest } from "../helper.js";
import { base64ToString, stringToBase64 } from "../utils.js";
import { Difficulty, GameMode, type Save } from "../types.js";

interface SavesResponse {
  saves: Save[]
}

export const getSaves = defineTool({
  name: "get_saves",
  description: "Get the list of saves on the Minecraft server.",
  input: {},
  output: {
    saves: z.array(z.object({
      name: z
        .string()
        .describe("The name of the save."),
      displayName: z
        .string()
        .describe("The display name of the save."),
      path: z
        .string()
        .describe("The path of the save on the server."),
      size: z
        .number()
        .describe("The size of the save in bytes."),
      isRunning: z
        .boolean()
        .describe("Whether the save is currently running (not necessarily currently selected one)."),
      isCurrent: z
        .boolean()
        .describe("Whether the save is the currently selected one."),
      defaultGameMode: z
        .enum(Object.values(GameMode) as [string, ...string[]])
        .describe("The default game mode of the save."),
      difficulty: z
        .enum(Object.values(Difficulty) as [string, ...string[]])
        .describe("The difficulty of the save."),
      isDifficultyLocked: z
        .boolean()
        .describe("Whether the difficulty of the save is locked."),
      isHardcore: z
        .boolean()
        .describe("Whether the save is in hardcore mode."),
      datapacks: z
        .record(z.string(), z.boolean())
        .describe("The datapacks in the save, with the key being the datapack name and the value being whether the datapack is enabled.")
    }))
  },
  handler: async () => {
    const res = await sendGetRequest<SavesResponse>("/api/saves");
    return {
      saves: res.saves.map((save) => ({
        ...save,
        displayName: base64ToString(save.displayName)
      }))
    };
  }
});

export const editSave = defineTool({
  name: "edit_save",
  description: "Edit a save on the Minecraft server. You can edit the display name, the default game mode, difficulty, whether the difficulty is locked or whether it's in hardcore mode.",
  input: {
    saveName: z
      .string()
      .describe("The name of the save to edit."),
    displayName: z
      .string()
      .describe("The new display name of the save."),
    defaultGameMode: z
      .enum(Object.values(GameMode) as [string, ...string[]])
      .describe("The new default game mode of the save."),
    difficulty: z
      .enum(Object.values(Difficulty) as [string, ...string[]])
      .describe("The new difficulty of the save."),
    isDifficultyLocked: z
      .boolean()
      .describe("Whether the difficulty of the save is locked."),
    isHardcore: z
      .boolean()
      .describe("Whether the save is in hardcore mode.")
  },
  output: {},
  handler: async (params) => {
    const { saveName, displayName, ...rest } = params;
    await sendPostRequest(`/api/saves/${saveName}`, {
      displayName: stringToBase64(displayName),
      ...rest
    });
    return {};
  }
});

export const toggleSaveDatapack = defineTool({
  name: "toggle_save_datapack",
  description: "Enable or disable a datapack in a save on the Minecraft server.",
  input: {
    saveName: z
      .string()
      .describe("The name of the save to edit."),
    datapack: z
      .string()
      .describe("The name of the datapack to enable or disable."),
    enabled: z
      .boolean()
      .describe("Whether the datapack should be enabled or disabled.")
  },
  output: {},
  handler: async ({ saveName, datapack, enabled }) => {
    await sendPatchRequest(`/api/saves/${saveName}?datapack=${datapack}&enabled=${enabled ? "1" : "0"}`);
    return {};
  }
});

export const deleteSave = defineTool({
  name: "delete_save",
  description: "Delete a save on the Minecraft server. This action is irreversible, so be careful when using this tool.",
  input: {
    saveName: z
      .string()
      .describe("The name of the save to delete.")
  },
  output: {},
  handler: async ({ saveName }) => {
    await sendDeleteRequest(`/api/saves/${saveName}`);
    return {};
  }
});
