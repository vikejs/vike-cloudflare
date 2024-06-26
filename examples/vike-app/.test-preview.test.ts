import { testRun } from "./.testRun";

testRun("pnpm run preview --port 3000", {
  doNotFailOnWarning: true,
  serverIsReadyMessage: "Starting local server",
  serverIsReadyDelay: 2000,
});
