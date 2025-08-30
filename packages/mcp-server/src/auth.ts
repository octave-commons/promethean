export function authorize(
  token: string | undefined,
  origin: string | undefined,
): boolean {
  const expectedToken = process.env.MCP_TOKEN;
  if (expectedToken && token !== expectedToken) return false;
  const allowlist =
    process.env.MCP_ORIGIN_ALLOWLIST?.split(",").filter(Boolean) ?? [];
  if (allowlist.length && origin && !allowlist.includes(origin)) return false;
  return true;
}
