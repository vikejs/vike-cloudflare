import { buildPlugin } from "./build";
import { definePlugin } from "./define";
import { optionalPlugin } from "./optional";
import { resolveConditionsPlugin } from "./resolve-conditions";
import { entriesPlugin } from "./entries";
import { envPlugin } from "./envs";
import { definePhotonLib } from "@photonjs/core/api";

export const pages = () => {
  return [
    envPlugin(),
    definePlugin(),
    resolveConditionsPlugin(),
    entriesPlugin(),
    buildPlugin(),
    optionalPlugin(),
    ...definePhotonLib("vike-cloudflare"),
  ];
};
