export const NAME = "vike-cloudflare";
export const WORKER_JS_NAME = "_worker.js";
export const WORKER_NAME = "cloudflare-worker";
export const ROUTES_JSON_NAME = "_routes.json";
export const isWin = process.platform === "win32";
export const isCI = Boolean(process.env.CI);

export const virtualWorkerEntryId = "virtual:vike-cloudflare:worker-entry";
export const resolvedVirtualWorkerEntryId = `\0${virtualWorkerEntryId}`;
export const virtualUserEntryId = "virtual:vike-cloudflare:user-entry";
export const virtualDefaultEntryId = "virtual:vike-cloudflare:default-entry";
export const resolvedVirtualDefaultEntryId = `\0${virtualDefaultEntryId}`;
