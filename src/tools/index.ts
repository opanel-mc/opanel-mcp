import * as info from "./info.js";
import { ToolDef } from "./tool-definition.js";

export const tools: ToolDef<any, any>[] = [
  ...Object.values(info),
];
