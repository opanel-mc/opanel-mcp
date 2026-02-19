import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getArgValue, validateServerArg, validateTokenArg } from "./helper.js";
import { tools } from "./tools/index.js";

const server = new McpServer({
  name: "opanel-mcp",
  version: "1.0.0",
});

// Register tools
tools.forEach((tool) => server.registerTool(
  tool.name,
  {
    description: tool.description,
    inputSchema: tool.input,
    outputSchema: tool.output,
  },
  async (input: Record<string, unknown>): Promise<CallToolResult> => {
    try {
      const output = await tool.handler(input);
      return {
        structuredContent: output,
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            status: "ok",
            ...output
          }),
        }]
      };
    } catch (e) {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            status: "error",
            error: e instanceof Error ? e.message : "Unknown error"
          }),
        }]
      };
    }
  }
));

async function main() {
  const serverArg = getArgValue("server");
  const tokenArg = getArgValue("token");

  // Check and validate required arguments
  if(!serverArg || !tokenArg) {
    console.error("Missing required arguments: --server and --token");
    process.exit(1);
  }

  try {
    validateServerArg(serverArg);
  } catch(error) {
    console.error(error instanceof Error ? error.message : "Invalid server URL");
    process.exit(1);
  }
  try {
    validateTokenArg(tokenArg);
  } catch(error) {
    console.error(error instanceof Error ? error.message : "Invalid token");
    process.exit(1);
  }

  // Run the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OPanel MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
