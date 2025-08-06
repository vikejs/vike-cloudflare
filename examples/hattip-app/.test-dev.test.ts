import { testRun } from "./.testRun";

testRun("pnpm run dev", {
  serverIsReadyMessage: "Server running",
  additionalTimeout: 1000,
});
