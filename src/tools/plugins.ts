import type { Plugin } from "../types.js";
import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendGetRequest } from "../helper.js";
import { base64ToString } from "../utils.js";

interface PluginsResponse {
  plugins: Plugin[]
  folderPath: string
}

export const getPlugins = defineTool({
  name: "get_server_plugins",
  description: "Get the list of plugins/mods currently installed on the Minecraft server, as well as the path to the plugins/mods folder.",
  input: {},
  output: {
    plugins: z.array(z.object({
      fileName: z
        .string()
        .describe("The file name of the plugin/mod."),
      name: z
        .string()
        .describe("The name of the plugin/mod."),
      version: z
        .string()
        .optional()
        .describe("The version of the plugin/mod. This is not available for plugins/mods that is not loaded to the server."),
      description: z
        .string()
        .optional()
        .describe("The description of the plugin/mod. This is not available for plugins/mods that is not loaded to the server."),
      authors: z
        .array(z.string())
        .describe("The authors of the plugin/mod. This is not available for plugins/mods that is not loaded to the server."),
      website: z
        .string()
        .optional()
        .describe("The website of the plugin/mod. This is not available for plugins/mods that is not loaded to the server."),
      size: z
        .number()
        .describe("The file size of the plugin/mod in bytes."),
      enabled: z
        .boolean()
        .describe("Whether the plugin/mod is enabled."),
      loaded: z
        .boolean()
        .describe("Whether the plugin/mod is loaded to the server."),
    }))
    .describe("The list of plugins/mods currently installed on the Minecraft server."),
    folderPath: z
      .string()
      .describe("The path to the plugins/mods folder on the server."),
  },
  handler: async () => {
    const res = await sendGetRequest<PluginsResponse>("/api/plugins");
    return {
      plugins: res.plugins.map(({ fileName, description, ...rest }) => ({
        ...rest,
        fileName: base64ToString(fileName),
        description: description ? base64ToString(description) : undefined,
        icon: undefined
      })),
      folderPath: res.folderPath
    };
  }
});

export const installPlugin = defineTool({
  name: "install_plugin",
  description: "This MCP server does not provide plugin installation. Use other tools to download plugins/mods from browser, then manually place them into the server plugins/mods folder.",
  input: {},
  output: {
    supported: z
      .boolean()
      .describe("Whether this MCP server supports plugin installation."),
    nextSteps: z
      .array(z.string())
      .describe("Manual steps the caller agent should perform to install plugins/mods.")
  },
  handler: async () => {
    return {
      supported: false,
      nextSteps: [
        "Download plugin/mod files from platforms like Curseforge, Modrinth, Spigotmc or Bukkit via browser or other apps",
        "Place the downloaded files into the server plugins/mods folder.",
        "Restart or reload the server if needed."
      ]
    };
  }
});
