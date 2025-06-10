import type { ResolvedConfig, UserConfig } from "vite";
import { getVikeConfig } from "vike/plugin";
import { resolveServerConfig } from "vike-server/api";
import { assert } from "../../assert";

export function getUserServerConfig(config: UserConfig | ResolvedConfig) {
  const vike = getVikeConfig(config);
  const servers = resolveServerConfig(vike.config.server);
  // User is not required to provide a server entry when using vike-cloudflare
  if (servers.length <= 1) return;
  // First server config is user config, second one is vike-cloudflare
  const server = servers[0];
  assert(server);
  return server;
}
