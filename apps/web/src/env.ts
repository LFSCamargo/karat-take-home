function readBoolean(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined || value === '') {
    return defaultValue;
  }

  return value === 'true';
}

export const publicEnv = {
  apiBaseUrl: import.meta.env.VITE_PUBLIC_API_URL ?? 'http://localhost:3333',
  useMockData: readBoolean(import.meta.env.VITE_PUBLIC_USE_MOCK_DATA, true),
} as const;
