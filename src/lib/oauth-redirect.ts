/** HTML redirect that replaces the OAuth callback entry in browser history. */
export function oauthReplaceRedirect(targetUrl: string): string {
  const safeTarget = JSON.stringify(targetUrl);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Signing in…</title>
    <script>window.location.replace(${safeTarget});</script>
  </head>
  <body></body>
</html>`;
}
