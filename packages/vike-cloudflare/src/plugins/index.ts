import { buildPlugin } from "./build";
import { definePlugin } from "./define";
import { optionalPlugin } from "./optional";
import { resolveConditionsPlugin } from "./resolve-conditions";
import { entriesPlugin } from "./entries";

export const pages = () => {
  return [definePlugin(), resolveConditionsPlugin(), entriesPlugin(), buildPlugin(), optionalPlugin()];
};
