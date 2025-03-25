export type SupportedServers = "hono" | "hono-dev" | "hattip";

export interface VikeCloudflarePagesOptions {
  server?: {
    entry: string;
  };
}
