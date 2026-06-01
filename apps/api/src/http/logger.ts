export type LogLevel = 'info' | 'warn' | 'error';

export type LogFields = Record<string, unknown>;

function safeSerialize(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ message: 'Failed to serialize log fields' });
  }
}

export function log(level: LogLevel, message: string, fields: LogFields = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  console.log(safeSerialize(entry));
}
