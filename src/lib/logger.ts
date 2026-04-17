import { posthog } from "./posthog";

type ErrorContext = Record<string, unknown>;

export function logError(where: string, err: unknown, context?: ErrorContext) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  if (typeof posthog.capture === "function") {
    posthog.capture("error_occurred", { where, message, stack, ...context });
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(`[${where}]`, err, context);
  }
}
