import { SPOTIFY_TOKEN_URL } from "@/lib/spotify/constants";
import type { FetchLike, SpotifyTokenResponse } from "@/lib/spotify/types";

export class SpotifyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyAuthError";
  }
}

export function requireSpotifyCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new SpotifyAuthError(
      "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET. Configure GitHub Actions secrets or export them locally for import:spotify.",
    );
  }
  return { clientId, clientSecret };
}

export async function fetchClientCredentialsToken(
  fetchImpl: FetchLike,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetchImpl(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const bodyText = await res.text();
  if (!res.ok) {
    throw new SpotifyAuthError(
      `Spotify token request failed (${res.status}). Check client ID/secret and app permissions. Response: ${bodyText.slice(0, 200)}`,
    );
  }

  let parsed: SpotifyTokenResponse;
  try {
    parsed = JSON.parse(bodyText) as SpotifyTokenResponse;
  } catch {
    throw new SpotifyAuthError("Spotify token response was not valid JSON.");
  }

  if (!parsed.access_token) {
    throw new SpotifyAuthError("Spotify token response did not include access_token.");
  }
  return parsed.access_token;
}
