import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendDeleteRequest, sendGetRequest } from "../helper.js";

export const getLogs = defineTool({
  name: "get_log_file_names",
  description: "Get the list of file names of the logs currently available on the Minecraft server.",
  input: {},
  output: {
    logs: z
      .array(z.string())
      .describe("The list of file names of the logs currently available on the Minecraft server.")
  },
  handler: async () => {
    return await sendGetRequest<{ logs: string[] }>("/api/logs");
  },
});

export const getLogContent = defineTool({
  name: "get_log_content",
  description: "Get the content of a log file on the Minecraft server.",
  input: {
    fileName: z
      .string()
      .describe("The name of the log file to get the content of.")
  },
  output: {
    content: z
      .string()
      .describe("The content of the log file.")
  },
  handler: async ({ fileName }) => {
    const content = await sendGetRequest<string>(`/api/logs/${fileName}`);
    return { content };
  }
});

export const getLatestLog = defineTool({
  name: "get_latest_log_content",
  description: "Get the content of the latest log file on the Minecraft server.",
  input: {},
  output: {
    content: z
      .string()
      .describe("The content of the latest log file.")
  },
  handler: async () => {
    const content = await sendGetRequest<string>("/api/logs/latest.log");
    return { content };
  }
});

export const deleteLog = defineTool({
  name: "delete_log_file",
  description: "Delete a log file on the Minecraft server.",
  input: {
    fileName: z
      .string()
      .describe("The name of the log file to delete.")
  },
  output: {},
  handler: async ({ fileName }) => {
    await sendDeleteRequest(`/api/logs/${fileName}`);
    return {};
  }
});

export const clearLogs = defineTool({
  name: "clear_log_files",
  description: "Delete all log files except latest.log and debug.log on the Minecraft server.",
  input: {},
  output: {},
  handler: async () => {
    await sendDeleteRequest("/api/logs");
    return {};
  }
});
