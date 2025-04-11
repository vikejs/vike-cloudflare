import hattipAsset from "../assets/hattip.js?raw";
import honoAsset from "../assets/hono.js?raw";
import vikeAsset from "../assets/vike.js?raw";
import type { SupportedServers } from "./types";

export function getAsset(kind: SupportedServers | "vike" | undefined) {
  switch (kind) {
    case "hono": {
      return honoAsset;
    }
    case "hattip": {
      return hattipAsset;
    }
    default:
      return vikeAsset;
  }
}
