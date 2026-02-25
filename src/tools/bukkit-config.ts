import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendGetRequest, sendPostRequest } from "../helper.js";
import { base64ToString, stringToBase64 } from "../utils.js";

export const getBukkitServerConfig = defineTool({
  name: "get_bukkit_server_config",
  description: "Get the configuration file content of the Minecraft server. Note that this tool is only available for Bukkit/Spigot/Paper servers.",
  input: {
    configFile: z
      .enum([
        "bukkit.yml",
        "spigot.yml",
        "config/paper-global.yml",
        "leaves.yml",
      ])
      .describe("The name of the configuration file to retrieve."),
  },
  output: {
    content: z
      .string()
      .describe("The content of the configuration file."),
  },
  handler: async ({ configFile }) => {
    const res = await sendGetRequest<Record<string, string>>(`/api/control/bukkit-config`);
    switch(configFile) {
      case "bukkit.yml": return { content: base64ToString(res["bukkit"]) };
      case "spigot.yml": return { content: base64ToString(res["spigot"]) };
      case "config/paper-global.yml": return { content: base64ToString(res["paper"]) };
      case "leaves.yml": return { content: base64ToString(res["leaves"]) };
    }
  }
});

export const setBukkitServerConfig = defineTool({
  name: "set_bukkit_server_config",
  description: "Set the configuration file content of the Minecraft server. Note that this tool is only available for Bukkit/Spigot/Paper servers. This will overwrite the existing configuration file, so be careful when using this tool. Reload or restart the server after using this tool to apply the new configuration.",
  input: {
    configFile: z
      .enum([
        "bukkit.yml",
        "spigot.yml",
        "config/paper-global.yml",
        "leaves.yml",
      ])
      .describe("The name of the configuration file to set."),
    content: z
      .string()
      .describe("The new content of the configuration file."),
  },
  output: {},
  handler: async ({ configFile, content }) => {
    let targetConfig: string;
    switch(configFile) {
      case "bukkit.yml":
        targetConfig = "bukkit";
        break;
      case "spigot.yml":
        targetConfig = "spigot";
        break;
      case "config/paper-global.yml":
        targetConfig = "paper";
        break;
      case "leaves.yml":
        targetConfig = "leaves";
        break;
    }
    await sendPostRequest(`/api/control/bukkit-config?target=${targetConfig}`, stringToBase64(content));
    return {};
  }
});
