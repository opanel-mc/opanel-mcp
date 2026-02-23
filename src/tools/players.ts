import * as z from "zod";
import { defineTool } from "./tool-definition.js";
import { sendDeleteRequest, sendGetRequest, sendPostRequest } from "../helper.js";
import { base64ToString, stringToBase64 } from "../utils.js";
import { GameMode, Player, type Whitelist } from "../types.js"

interface PlayersOverviewResponse {
  maxPlayerCount: number
  whitelist: boolean
}

interface PlayersListResponse {
  players: Player[]
}

interface WhitelistResponse {
  whitelist: Whitelist
}

interface BannedIpsResponse {
  bannedIps: string[]
}

export const getPlayers = defineTool({
  name: "get_players",
  description: "Get the list of players currently on the Minecraft server, as well as the maximum player count and whether the whitelist is enabled.",
  input: {},
  output: {
    players: z.array(z.object({
      name: z
        .string()
        .optional()
        .describe("The name of the player. Bot players and the players that is not correctly cached in the usercache may not have a name."),
      uuid: z
        .string()
        .describe("The UUID of the player."),
      isOnline: z
        .boolean()
        .describe("Whether the player is currently online."),
      isOp: z
        .boolean()
        .describe("Whether the player is an operator (op)."),
      isBanned: z
        .boolean()
        .describe("Whether the player is banned."),
      gamemode: z
        .enum(Object.values(GameMode) as [string, ...string[]])
        .describe("The game mode of the player."),
      banReason: z
        .string()
        .optional()
        .describe("The reason why the player is banned. This is only available when the player is banned."),
      isWhitelisted: z
        .boolean()
        .optional()
        .describe("Whether the player is whitelisted. This is only available when the whitelist is enabled."),
      ping: z
        .number()
        .optional()
        .describe("The ping of the player in milliseconds. This is only available when the player is online."),
      ip: z
        .string()
        .optional()
        .describe("The IP address of the player. This is only available when the player is online."),
    })),
    maxPlayerCount: z
      .number()
      .int()
      .describe("The maximum number of players allowed on the Minecraft server."),
    whitelist: z
      .boolean()
      .describe("Whether the whitelist is enabled on the Minecraft server.")
  },
  handler: async () => {
    const overviewRes = await sendGetRequest<PlayersOverviewResponse>("/players");
    const listRes = await sendGetRequest<PlayersListResponse>("/players/list");
    return {
      players: listRes.players.map(({ banReason, ...rest }) => ({
        ...rest,
        banReason: banReason ? base64ToString(banReason) : undefined
      })),
      ...overviewRes
    };
  }
});

export const givePlayerOp = defineTool({
  name: "give_player_op",
  description: "Give a player operator (op) permission on the Minecraft server.",
  input: {
    uuid: z
      .string()
      .describe("The UUID of the player to give op permission to.")
  },
  output: {},
  handler: async ({ uuid }) => {
    await sendPostRequest(`/api/players/op?uuid=${uuid}`);
    return {};
  }
});

export const deprivePlayerOp = defineTool({
  name: "deprive_player_op",
  description: "Deprive a player of operator (op) permission on the Minecraft server.",
  input: {
    uuid: z
      .string()
      .describe("The UUID of the player to deprive op permission from.")
  },
  output: {},
  handler: async ({ uuid }) => {
    await sendPostRequest(`/api/players/deop?uuid=${uuid}`);
    return {};
  }
});

export const kickPlayer = defineTool({
  name: "kick_player",
  description: "Kick a player from the Minecraft server.",
  input: {
    uuid: z
      .string()
      .describe("The UUID of the player to kick."),
    reason: z
      .string()
      .describe("The reason for kicking the player.")
  },
  output: {},
  handler: async ({ uuid, reason }) => {
    await sendPostRequest(`/api/players/kick?uuid=${uuid}&r=${stringToBase64(reason)}`);
    return {};
  }
});

export const banPlayer = defineTool({
  name: "ban_player",
  description: "Ban a player from the Minecraft server.",
  input: {
    uuid: z
      .string()
      .describe("The UUID of the player to ban."),
    reason: z
      .string()
      .describe("The reason for banning the player.")
  },
  output: {},
  handler: async ({ uuid, reason }) => {
    await sendPostRequest(`/api/players/ban?uuid=${uuid}&r=${stringToBase64(reason)}`);
    return {};
  }
});

export const pardonPlayer = defineTool({
  name: "pardon_player",
  description: "Pardon a player from the ban list of the Minecraft server.",
  input: {
    uuid: z
      .string()
      .describe("The UUID of the player to pardon.")
  },
  output: {},
  handler: async ({ uuid }) => {
    await sendPostRequest(`/api/players/pardon?uuid=${uuid}`);
    return {};
  }
});

export const setPlayerGamemode = defineTool({
  name: "set_player_gamemode",
  description: "Set the game mode of a player on the Minecraft server.",
  input: {
    uuid: z
      .string()
      .describe("The UUID of the player to set game mode for."),
    gamemode: z
      .enum(Object.values(GameMode) as [string, ...string[]])
      .describe("The game mode to set for the player.")
  },
  output: {},
  handler: async ({ uuid, gamemode }) => {
    await sendPostRequest(`/api/players/gamemode?uuid=${uuid}&gm=${gamemode}`);
    return {};
  }
});

export const deletePlayerData = defineTool({
  name: "delete_player_data",
  description: "Delete a player's data (/<server_root_dir>/world/playerdata/<player_uuid>.dat) from the Minecraft server. This will reset the player's inventory, position, and other data to the default state when they join the server again.",
  input: {
    uuid: z
      .string()
      .describe("The UUID of the player to delete data for.")
  },
  output: {},
  handler: async ({ uuid }) => {
    await sendDeleteRequest(`/api/players?uuid=${uuid}`);
    return {};
  }
});

export const getWhitelist = defineTool({
  name: "get_whitelist",
  description: "Get the whitelist of the Minecraft server.",
  input: {},
  output: {
    whitelist: z.array(z.object({
      name: z
        .string()
        .describe("The name of the whitelisted player."),
      uuid: z
        .string()
        .describe("The UUID of the whitelisted player.")
    }))
  },
  handler: async () => {
    return await sendGetRequest<WhitelistResponse>("/api/whitelist");
  }
});

export const toggleWhitelist = defineTool({
  name: "toggle_whitelist",
  description: "Enable or disable the whitelist of the Minecraft server.",
  input: {
    enabled: z
      .boolean()
      .describe("Whether to enable the whitelist. Set to true to enable, or false to disable.")
  },
  output: {},
  handler: async ({ enabled }) => {
    await sendPostRequest(`/api/whitelist/${enabled ? "enable" : "disable"}`);
    return {};
  }
});

export const addToWhitelist = defineTool({
  name: "add_to_whitelist",
  description: "Add a player to the whitelist of the Minecraft server.",
  input: {
    name: z
      .string()
      .describe("The name of the player to add to the whitelist."),
    uuid: z
      .string()
      .describe("The UUID of the player to add to the whitelist.")
  },
  output: {},
  handler: async ({ name, uuid }) => {
    await sendPostRequest(`/api/whitelist/add?name=${name}&uuid=${uuid}`);
    return {};
  }
});

export const removeFromWhitelist = defineTool({
  name: "remove_from_whitelist",
  description: "Remove a player from the whitelist of the Minecraft server.",
  input: {
    name: z
      .string()
      .describe("The name of the player to remove from the whitelist."),
    uuid: z
      .string()
      .describe("The UUID of the player to remove from the whitelist.")
  },
  output: {},
  handler: async ({ name, uuid }) => {
    await sendPostRequest(`/api/whitelist/remove?name=${name}&uuid=${uuid}`);
    return {};
  }
});

export const getBannedIps = defineTool({
  name: "get_banned_ips",
  description: "Get the list of banned IP addresses on the Minecraft server.",
  input: {},
  output: {
    bannedIps: z
      .array(z.string())
      .describe("The list of banned IP addresses.")
  },
  handler: async () => {
    return await sendGetRequest<BannedIpsResponse>("/api/banned-ips");
  }
});

export const banIp = defineTool({
  name: "ban_ip",
  description: "Ban an IP address from accessing the Minecraft server.",
  input: {
    ip: z
      .string()
      .describe("The IP address to ban."),
  },
  output: {},
  handler: async ({ ip }) => {
    await sendPostRequest(`/api/banned-ips/add?ip=${ip}`);
    return {};
  }
});

export const pardonIp = defineTool({
  name: "pardon_ip",
  description: "Pardon an IP address from the ban list of the Minecraft server.",
  input: {
    ip: z
      .string()
      .describe("The IP address to pardon."),
  },
  output: {},
  handler: async ({ ip }) => {
    await sendPostRequest(`/api/banned-ips/remove?ip=${ip}`);
    return {};
  }
});
