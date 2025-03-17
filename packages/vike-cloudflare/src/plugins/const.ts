export const NAME = "vike-cloudflare";
export const WORKER_JS_NAME = "_worker.js";
export const WORKER_NAME = "cloudflare-worker";
export const ROUTES_JSON_NAME = "_routes.json";
export const isWin = process.platform === "win32";
export const isCI = Boolean(process.env.CI);

export const virtualUserEntryId = "virtual:vike-cloudflare:user-entry";
export const resolvedVirtualUserEntryId = `${virtualUserEntryId}-resolved`;
export const virtualProdEntryId = "virtual:vike-cloudflare:prod-entry";
export const resolvedVirtualProdEntryId = `\0${virtualProdEntryId}`;
export const virtualEntryAuto = "virtual:vike-cloudflare:auto-entry";
