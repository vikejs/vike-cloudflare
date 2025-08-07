import vikeSolid from "vike-solid/config";
import vikeCloudflare from "vike-cloudflare/config";
import type { Config } from "vike/types";
import Head from "../layouts/HeadDefault.js";
import Layout from "../layouts/LayoutDefault.js";

export default {
  Layout,
  Head,
  title: "My Vike App",
  // @ts-ignore
  server: "hattip-entry.ts",
  extends: [vikeSolid, vikeCloudflare],
} satisfies Config;
