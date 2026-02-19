import dotenv from "dotenv";
import { spawn } from "node:child_process";

dotenv.config();

const server = process.env.SERVER ?? process.env.server;
const token = process.env.TOKEN ?? process.env.token;

if(!server || !token) {
  console.error("Missing required values in .env: SERVER and TOKEN");
  process.exit(1);
}

const child = spawn(
  "npx",
  [
    "@modelcontextprotocol/inspector",
    "node",
    "build/index.js",
    "--",
    "--server",
    server,
    "--token",
    token,
  ],
  { stdio: "inherit", shell: true }
);

child.on("exit", (code, signal) => {
  if(signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
