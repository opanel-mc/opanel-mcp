import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendGetRequest, sendPostRequest } from "../helper.js";
import { base64ToString, stringToBase64 } from "../utils.js";

interface VersionResponse {
  serverType: string
  version: string
}

interface InfoResponse {
  favicon: string | null
  motd: string // base64
  port: number
  maxPlayerCount: number
  whitelist: boolean
  uptime: number
  ingameTime: {
    current: number
    doDaylightCycle: boolean
    paused: boolean
    mspt: number
  }
  system: {
    os: string
    arch: string
    cpuName: string
    cpuCore: number
    memory: number
    gpus: string[]
    java: string
  }
}

interface MonitorResponse {
  cpu: number
  memory: number
  tps: number
}

interface ServerPropertiesResponse {
  properties: string // base64
}

export const getInfo = defineTool({
  name: "get_info",
  description: "Get basic info of the Minecraft server that OPanel is running on, such as motd, port, in-game time or server system information.",
  input: {},
  output: {
    serverType: z
      .string()
      .describe("The type of the Minecraft server, e.g. Spigot, Paper, etc."),
    version: z
      .string()
      .describe("The version of the Minecraft server."),
    motd: z
      .string()
      .describe("The Message of the Day (MOTD) of the Minecraft server."),
    port: z
      .number()
      .int()
      .describe("The port number the Minecraft server is running on."),
    maxPlayerCount: z
      .number()
      .int()
      .describe("The maximum number of players allowed on the Minecraft server."),
    whitelist: z
      .boolean()
      .describe("Whether the Minecraft server has whitelist enabled."),
    uptime: z
      .number()
      .int()
      .describe("The uptime of the Minecraft server in milliseconds."),
    tps: z
      .number()
      .describe("The current ticks per second (TPS) of the Minecraft server, which indicates the server performance. A TPS of 20 means the server is running perfectly, while a lower TPS indicates lag."),
    ingameTime: z.object({
      current: z
        .number()
        .int()
        .describe("The current in-game time of the Minecraft server."),
      doDaylightCycle: z
        .boolean()
        .describe("Whether the daylight cycle is enabled on the Minecraft server."),
      paused: z
        .boolean()
        .describe("Whether the Minecraft server is currently paused. (When the server is paused, the in-game time does not advance)"),
    }),
    system: z.object({
      os: z
        .string()
        .describe("The operating system the Minecraft server is running on."),
      arch: z
        .string()
        .describe("The CPU architecture of the system the Minecraft server is running on."),
      cpuName: z
        .string()
        .describe("The name of the CPU of the system the Minecraft server is running on."),
      cpuCore: z
        .number()
        .int()
        .describe("The number of CPU cores of the system the Minecraft server is running on."),
      cpuUsage: z
        .number()
        .int()
        .describe("The current CPU usage percentage of the Minecraft server."),
      memory: z
        .number()
        .int()
        .describe("The total memory of the system the Minecraft server is running on, in bytes."),
      memoryUsage: z
        .number()
        .int()
        .describe("The current memory usage percentage of the Minecraft server."),
      gpus: z
        .array(z.string())
        .describe("The list of GPU names of the system the Minecraft server is running on."),
      java: z
        .string()
        .describe("The Java version the Minecraft server is running with."),
    })
  },
  handler: async () => {
    const versionRes = await sendGetRequest<VersionResponse>("/api/version");
    const infoRes = await sendGetRequest<InfoResponse>("/api/info");
    const monitorRes = await sendGetRequest<MonitorResponse>("/api/monitor");
    
    return {
      serverType: versionRes.serverType,
      version: versionRes.version,
      motd: base64ToString(infoRes.motd),
      port: infoRes.port,
      maxPlayerCount: infoRes.maxPlayerCount,
      whitelist: infoRes.whitelist,
      uptime: infoRes.uptime,
      tps: monitorRes.tps,
      ingameTime: {
        current: infoRes.ingameTime.current,
        doDaylightCycle: infoRes.ingameTime.doDaylightCycle,
        paused: infoRes.ingameTime.paused
      },
      system: {
        os: infoRes.system.os,
        arch: infoRes.system.arch,
        cpuName: infoRes.system.cpuName,
        cpuCore: infoRes.system.cpuCore,
        cpuUsage: monitorRes.cpu,
        memory: infoRes.system.memory,
        memoryUsage: monitorRes.memory,
        gpus: infoRes.system.gpus,
        java: infoRes.system.java
      }
    };
  }
});

export const setMotd = defineTool({
  name: "set_motd",
  description: "Set the Message of the Day (MOTD) of the Minecraft server.",
  input: {
    motd: z
      .string()
      .describe("The new MOTD to set for the Minecraft server.")
  },
  output: {},
  handler: async ({ motd }) => {
    await sendPostRequest("/api/info/motd", stringToBase64(motd));
    return {};
  }
});

export const getServerProperties = defineTool({
  name: "get_server_properties",
  description: "Get the content of the server.properties file of the Minecraft server.",
  input: {},
  output: {
    properties: z
      .string()
      .describe("The content of the server.properties file, in plain text.")
  },
  handler: async () => {
    const { properties } = await sendGetRequest<ServerPropertiesResponse>("/api/control/properties");
    return {
      properties: base64ToString(properties)
    };
  }
});

export const setServerProperties = defineTool({
  name: "set_server_properties",
  description: "Set the content of the server.properties file of the Minecraft server. This will overwrite the existing server.properties file, so be careful when using this tool.",
  input: {
    properties: z
      .string()
      .describe("The new content of the server.properties file, in plain text.")
  },
  output: {},
  handler: async ({ properties }) => {
    await sendPostRequest("/api/control/properties", stringToBase64(properties));
    return {};
  }
});
