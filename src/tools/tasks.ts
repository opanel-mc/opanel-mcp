import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendDeleteRequest, sendGetRequest, sendPatchRequest, sendPostRequest } from "../helper.js";
import { ScheduledTask } from "../types.js";

export const getScheduledTasks = defineTool({
  name: "get_scheduled_tasks",
  description: "Get the list of scheduled tasks currently registered on OPanel.",
  input: {},
  output: {
    tasks: z
      .array(z.object({
        id: z
          .string()
          .describe("The id of the scheduled task."),
        name: z
          .string()
          .describe("The name of the scheduled task."),
        cron: z
          .string()
          .describe("The cron expression of the scheduled task."),
        commands: z
          .array(z.string())
          .describe("The list of commands to execute for the scheduled task."),
        enabled: z
          .boolean()
          .describe("Whether the scheduled task is enabled or not.")
      }))
      .describe("The list of scheduled tasks currently registered on OPanel.")
  },
  handler: async () => {
    return await sendGetRequest<{ tasks: ScheduledTask[] }>("/api/tasks");
  },
});

export const createScheduledTask = defineTool({
  name: "create_scheduled_task",
  description: "Create a new scheduled task on OPanel.",
  input: {
    name: z
      .string()
      .describe("The name of the scheduled task."),
    cron: z
      .string()
      .describe("The cron expression of the scheduled task."),
    commands: z
      .array(z.string())
      .describe("The list of commands to execute for the scheduled task."),
  },
  output: {
    id: z
      .string()
      .describe("The id of the newly created scheduled task.")
  },
  handler: async (params) => {
    const { taskId } = await sendPostRequest<{ taskId: string }>("/api/tasks", params);
    return { id: taskId };
  },
});

export const editScheduledTask = defineTool({
  name: "edit_scheduled_task",
  description: "Edit an existing scheduled task on OPanel.",
  input: {
    id: z
      .string()
      .describe("The id of the scheduled task to edit."),
    name: z
      .string()
      .describe("The name of the scheduled task."),
    cron: z
      .string()
      .describe("The cron expression of the scheduled task."),
    commands: z
      .array(z.string())
      .describe("The list of commands to execute for the scheduled task."),
  },
  output: {},
  handler: async (params) => {
    const { id, ...rest } = params;
    await sendPostRequest(`/api/tasks/${id}`, rest);
    return {};
  }
});

export const toggleScheduledTask = defineTool({
  name: "toggle_scheduled_task",
  description: "Enable or disable a scheduled task on OPanel.",
  input: {
    id: z
      .string()
      .describe("The id of the scheduled task to enable or disable."),
    enabled: z
      .boolean()
      .describe("Whether to enable or disable the scheduled task.")
  },
  output: {},
  handler: async ({ id, enabled }) => {
    await sendPatchRequest(`/api/tasks/${id}?enabled=${enabled ? "1" : "0"}`);
    return {};
  }
});

export const deleteScheduledTask = defineTool({
  name: "delete_scheduled_task",
  description: "Delete a scheduled task on OPanel.",
  input: {
    id: z
      .string()
      .describe("The id of the scheduled task to delete.")
  },
  output: {},
  handler: async ({ id }) => {
    await sendDeleteRequest(`/api/tasks/${id}`);
    return {};
  }
});
