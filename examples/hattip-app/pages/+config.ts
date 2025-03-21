import vikeSolid from "vike-solid/config";
import vikeCloudflare from "vike-cloudflare/config";
import type { Config } from "vike/types";
import Head from "../layouts/HeadDefault.js";
import Layout from "../layouts/LayoutDefault.js";

// Default config (can be overridden by pages)
export default {
  Layout,
  Head,
  title: "My Vike App",
  stream: "web",
  server: {
    kind: "hattip",
    entry: "hattip-entry.ts",
  },
  extends: [vikeSolid, vikeCloudflare],
} satisfies Config;
