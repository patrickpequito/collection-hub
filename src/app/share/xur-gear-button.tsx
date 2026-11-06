"use client";

import { useState } from "react";

/** Reads Xûr's weapons + catalysts with the signed-in session, then reloads the share kit. */
export function XurGearButton() {
  const [status, setStatus] = useState<"idle" | "loading" | string>("idle");

  async function load() {
    setStatus("loading");
    try {
      const response = await fetch("/api/xur", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as { gear: unknown; error?: string } | null;
      if (payload?.gear) {
        window.location.reload();
        return;
      }
      setStatus(payload?.error ?? `Request failed (${response.status})`);
    } catch {
      setStatus("Request failed");
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={load}
        disabled={status === "loading"}
        className="ui-label border border-white/30 px-3 py-2 text-bone! transition hover:border-bone disabled:opacity-50"
      >
        {status === "loading" ? "Loading…" : "Load Xûr's gear now"}
      </button>
      {status !== "idle" && status !== "loading" ? <p className="text-sm text-[#e07a3f]">{status}</p> : null}
    </div>
  );
}
