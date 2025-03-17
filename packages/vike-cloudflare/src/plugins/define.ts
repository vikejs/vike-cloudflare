import type { Plugin } from "vite";
import { NAME } from "./const";

export function definePlugin(): Plugin {
  return {
    name: `${NAME}:define`,
    apply: "build",
    config() {
      return {
        define: {
          "process.env.NODE_ENV": JSON.stringify("production"),
        },
      };
    },
  };
}
