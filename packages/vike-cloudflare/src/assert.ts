export function assert(condition: unknown, message = "[Bug] Reach out to a maintainer"): asserts condition {
  if (condition) {
    return;
  }
  throw new Error(message);
}
