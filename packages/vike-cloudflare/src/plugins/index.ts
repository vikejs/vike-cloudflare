import { buildPlugin } from "./build";
import { definePlugin } from "./define";
import { optionalPlugin } from "./optional";
import { resolveConditionsPlugin } from "./resolve-conditions";
import { entriesPlugin } from "./entries";
import { envPlugin } from "./envs";
import { installPhoton } from "@photonjs/core/vite";

export const pages = () => {
  return [
    envPlugin(),
    definePlugin(),
    resolveConditionsPlugin(),
    entriesPlugin(),
    buildPlugin(),
    optionalPlugin(),
    ...installPhoton("vike-cloudflare"),
  ];
};
