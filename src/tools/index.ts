import * as info from "./info.js";
import * as saves from "./saves.js";
import * as players from "./players.js";
import * as gamerules from "./gamerules.js";
import * as plugins from "./plugins.js";
import * as terminal from "./terminal.js";
import * as logs from "./logs.js";
import * as codeOfConduct from "./code-of-conduct.js";
import * as tasks from "./tasks.js";
import * as bukkitConfig from "./bukkit-config.js";
import { ToolDef } from "./tool-definition.js";

export const tools: ToolDef<any, any>[] = [
  ...Object.values(info),
  ...Object.values(saves),
  ...Object.values(players),
  ...Object.values(gamerules),
  ...Object.values(plugins),
  ...Object.values(terminal),
  ...Object.values(logs),
  ...Object.values(codeOfConduct),
  ...Object.values(tasks),
  ...Object.values(bukkitConfig),
];
