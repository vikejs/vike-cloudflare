import { pages } from "vike-cloudflare";
import vikeSolid from "vike-solid/vite";
import vike from "vike/plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vike({}), vikeSolid(), pages()],
});
