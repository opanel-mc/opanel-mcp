export function stringToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binStr = String.fromCharCode(...bytes);
  return btoa(binStr);
}

export function base64ToString(base64: string): string {
  const binStr = atob(base64);
  const bytes = Uint8Array.from(binStr, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
