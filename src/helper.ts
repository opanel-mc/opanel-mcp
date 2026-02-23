import axios from "axios";

export type APIResponse<T> = {
  code: number
  error: string
} & T;

export function getArgValue(name: string): string | undefined {
  const exactPrefix = `--${name}=`;

  for(let i = 0; i < process.argv.length; i += 1) {
    const arg = process.argv[i];

    if(arg === `--${name}`) {
      const next = process.argv[i + 1];
      if(next && !next.startsWith("--")) {
        return next;
      }
      return undefined;
    }

    if(arg.startsWith(exactPrefix)) {
      const value = arg.slice(exactPrefix.length).trim();
      return value.length > 0 ? value : undefined;
    }
  }

  return undefined;
}

export function validateServerArg(serverArg: string): void {
  let parsed: URL;

  try {
    parsed = new URL(serverArg);
  } catch {
    throw new Error("Invalid server URL: must be a valid URL.");
  }

  const isHttps = parsed.protocol === "https:";
  const isHttpLocalOnly = parsed.protocol === "http:" && (
    parsed.hostname === "localhost"
    || parsed.hostname.startsWith("192.168.")
  );

  if(!isHttps && !isHttpLocalOnly) {
    throw new Error("Invalid server URL: use https, or http with localhost/192.168.* only.");
  }
}

export function validateTokenArg(tokenArg: string): void {
  if(tokenArg.trim().length === 0) {
    throw new Error("Invalid token: token cannot be empty.");
  }
  if(!tokenArg.startsWith("o-") || tokenArg.length !== 50) {
    throw new Error("Invalid token: token must start with 'o-' and be 50 characters long.");
  }
}

export async function sendGetRequest<R>(route: string): Promise<APIResponse<R>> {
  return (await axios.request({
    method: "get",
    url: getArgValue("server") + route,
    headers: { "Authorization": `Bearer ${getArgValue("token")}` },
  })).data as APIResponse<R>;
}

export async function sendPostRequest<R, T = any>(route: string, body?: T): Promise<APIResponse<R>> {
  const data = body ? (
    typeof body === "string" ? body : JSON.stringify(body)
  ) : "";
  
  return (await axios.request({
    method: "post",
    maxBodyLength: Infinity,
    url: getArgValue("server") + route,
    headers: {
      "Content-Type": "text/plain",
      "Authorization": `Bearer ${getArgValue("token")}`
    },
    data
  })).data as APIResponse<R>;
}

export async function sendPatchRequest<R, T = any>(route: string, body?: T): Promise<APIResponse<R>> {
  const data = body ? (
    typeof body === "string" ? body : JSON.stringify(body)
  ) : "";
  
  return (await axios.request({
    method: "patch",
    maxBodyLength: Infinity,
    url: getArgValue("server") + route,
    headers: {
      "Content-Type": "text/plain",
      "Authorization": `Bearer ${getArgValue("token")}`
    },
    data
  })).data as APIResponse<R>;
}

export async function sendDeleteRequest<T = any>(route: string, body?: T): Promise<APIResponse<never>> {
  const data = body ? (
    typeof body === "string" ? body : JSON.stringify(body)
  ) : "";
  
  return (await axios.request({
    method: "delete",
    maxBodyLength: Infinity,
    url: getArgValue("server") + route,
    headers: {
      "Content-Type": "text/plain",
      "Authorization": `Bearer ${getArgValue("token")}`
    },
    data
  })).data as APIResponse<never>;
}
