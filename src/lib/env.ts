function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable ${name} in .env.local`);
  }
  return value;
}

export function getBungieApiKey(): string {
  return requireEnv("BUNGIE_API_KEY");
}

export function getBungieOAuthConfig() {
  return {
    apiKey: getBungieApiKey(),
    clientId: requireEnv("BUNGIE_CLIENT_ID"),
    clientSecret: requireEnv("BUNGIE_CLIENT_SECRET"),
    redirectUri: requireEnv("BUNGIE_REDIRECT_URI"),
  };
}

export function getSessionSecret(): string {
  return requireEnv("SESSION_SECRET");
}

/** App origin (e.g. https://127.0.0.1:3000), derived from the Bungie redirect URI. */
export function getAppOrigin(): string {
  return new URL(requireEnv("BUNGIE_REDIRECT_URI")).origin;
}

export function isBungieOAuthConfigured(): boolean {
  return Boolean(
    process.env.BUNGIE_API_KEY?.trim() &&
      process.env.BUNGIE_CLIENT_ID?.trim() &&
      process.env.BUNGIE_CLIENT_SECRET?.trim() &&
      process.env.BUNGIE_REDIRECT_URI?.trim() &&
      process.env.SESSION_SECRET?.trim(),
  );
}
