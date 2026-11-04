// _______________This Code was generated using GenAI tool : Codify, Please check for accuracy_______________
// Minimal structured logger. Never pass secrets, cookies, tokens or child personal data.

export interface Logger {
  info(event: string, data?: Record<string, unknown>): void;
  warn(event: string, data?: Record<string, unknown>): void;
  error(event: string, data?: Record<string, unknown>): void;
}

export const consoleLogger: Logger = {
  info: (event, data) => console.info(JSON.stringify({ level: "info", event, ...data })),
  warn: (event, data) => console.warn(JSON.stringify({ level: "warn", event, ...data })),
  error: (event, data) => console.error(JSON.stringify({ level: "error", event, ...data })),
};

export const silentLogger: Logger = { info: () => {}, warn: () => {}, error: () => {} };
