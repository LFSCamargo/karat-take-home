import { publicEnv } from '../../../env';

function buildApiUrl(path: string): string {
  const baseUrl = publicEnv.apiBaseUrl.replace(/\/$/, '');
  return `${baseUrl}${path}`;
}

export async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path));

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
