type BungieLoginButtonProps = {
  configured: boolean;
};

export function BungieLoginButton({ configured }: BungieLoginButtonProps) {
  if (!configured) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-200 disabled:cursor-not-allowed"
      >
        Configure OAuth in .env.local
      </button>
    );
  }

  return (
    <a
      href="/api/auth/bungie"
      className="flex w-full items-center justify-center rounded-xl bg-[#f2721b] px-3 py-2 text-sm font-semibold text-black transition hover:bg-[#ff8a3d]"
    >
      Sign in with Bungie
    </a>
  );
}
