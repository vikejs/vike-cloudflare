import { testRun } from "./.testRun";

testRun("pnpm run dev --port 3000", {
  serverIsReadyMessage: "Local:",
  additionalTimeout: 1000,
});
