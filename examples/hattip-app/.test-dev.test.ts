import { testRun } from "../hono-app/.testRun";

testRun("pnpm run dev", {
  serverIsReadyMessage: "Server running",
  additionalTimeout: 1000,
  hasServer: true,
});
