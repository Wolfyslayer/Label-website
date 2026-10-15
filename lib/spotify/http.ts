import type { FetchLike } from "@/lib/spotify/types";

export class SpotifyApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "SpotifyApiError";
    this.status = status;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type SpotifyHttpOptions = {
  fetchImpl?: FetchLike;
  maxRetries?: number;
  minDelayMs?: number;
};

export async function spotifyGetJson<T>(
  url: string,
  accessToken: string,
  options: SpotifyHttpOptions = {},
): Promise<T> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const maxRetries = options.maxRetries ?? 5;
  const minDelayMs = options.minDelayMs ?? 0;

  let attempt = 0;
  while (true) {
    if (minDelayMs > 0) await sleep(minDelayMs);

    const res = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 429 && attempt < maxRetries) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? "1");
      await sleep(Math.max(1, retryAfter) * 1000);
      attempt += 1;
      continue;
    }

    if (res.status >= 500 && attempt < maxRetries) {
      await sleep(500 * 2 ** attempt);
      attempt += 1;
      continue;
    }

    const text = await res.text();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new SpotifyApiError(
          res.status,
          `Spotify API authorization failed (${res.status}). The app may lack permission for this endpoint or be in restricted development mode. ${text.slice(0, 300)}`,
        );
      }
      throw new SpotifyApiError(
        res.status,
        `Spotify API request failed (${res.status}) for ${url}: ${text.slice(0, 300)}`,
      );
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new SpotifyApiError(res.status, "Spotify API returned non-JSON body.");
    }
  }
}
