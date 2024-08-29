declare global {
  namespace Vike {
    interface PageContext {
      ctx?: {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        waitUntil(promise: Promise<any>): void;
        passThroughOnException(): void;
      };
      env?: Record<string | symbol | number, unknown>;
    }
  }
}

export type {};
