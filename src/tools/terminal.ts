import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendGetRequest, sendPostRequest } from "../helper.js";

export const getCommands = defineTool({
  name: "get_server_commands",
  description: "Get the list of commands currently registered on the Minecraft server.",
  input: {},
  output: {
    commands: z
      .array(z.string())
      .describe("The list of commands currently registered on the Minecraft server.")
  },
  handler: async () => {
    return await sendGetRequest<{ commands: string[] }>("/api/terminal");
  },
});

export const sendCommand = defineTool({
  name: "send_server_command",
  description: "Send a command to the Minecraft server. Use the tool get_latest_log_content to check the output of the command.",
  input: {
    command: z
      .string()
      .describe("The command to send to the Minecraft server.")
  },
  output: {},
  handler: async ({ command }) => {
    await sendPostRequest("/api/terminal", command);
    return {};
  }
});
