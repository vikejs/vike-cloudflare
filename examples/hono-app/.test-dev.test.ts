import { testRun } from "../hono-app/.testRun";

testRun("pnpm run dev", {
  hasServer: true,
  serverIsReadyMessage: "Server running",
});
