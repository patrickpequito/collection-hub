"use client";

import { useActionState, useState, useTransition } from "react";
import { resetAdminWeek, saveAdminWeek, type AdminSaveState } from "@/app/admin/actions";
import type { RotationStatus } from "@/lib/destinations/rotation-learning";

export type AdminSelectOption = { value: string; label: string };

export type AdminRotationRow = {
  key: string;
  label: string;
  options: string[];
  /** What the site expects this week without an admin pick. */
  predicted: string;
  /** Current value (admin pick or prediction). */
  value: string;
  status: RotationStatus;
  /** Cycle length and distinct values confirmed so far. */
  length: number;
  seen: number;
  history: string[];
  savedThisWeek: boolean;
};

type AdminWeekFormProps = {
  week: number;
  dates: string;
  raids: AdminSelectOption[];
  dungeons: AdminSelectOption[];
  featuredRaids: string[];
  featuredDungeons: string[];
  featuredFromAdmin: { raids: boolean; dungeons: boolean };
  groups: { name: string; rows: AdminRotationRow[] }[];
};

const STATUS_STYLE: Record<RotationStatus | "mismatch" | "auto" | "admin", { label: string; color: string }> = {
  learning: { label: "Learning", color: "#e8c860" },
  predicted: { label: "Predicted", color: "#24b4b3" },
  confirmed: { label: "Confirmed", color: "#4fbf73" },
  mismatch: { label: "Mismatch", color: "#e07a3f" },
  auto: { label: "Auto", color: "#8b9099" },
  admin: { label: "Your pick", color: "#24b4b3" },
};

const SELECT =
  "h-[38px] w-full border border-white/[0.22] bg-void px-3 text-sm text-bone outline-none transition focus:border-bone";
const BUTTON = "font-display text-[13px] uppercase tracking-[0.14em] px-[18px] py-2.5 border transition disabled:opacity-50";

function Status({ kind }: { kind: keyof typeof STATUS_STYLE }) {
  const style = STATUS_STYLE[kind];
  return (
    <span
      className="inline-block border px-2 py-[3px] font-display text-[10.5px] uppercase tracking-[0.16em]"
      style={{ color: style.color, borderColor: style.color }}
    >
      {style.label}
    </span>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="ui-panel mb-3.5 px-[18px] py-4">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.14] pb-2.5">
        <h2 className="font-display text-lg font-semibold uppercase tracking-[0.06em] text-bone">{title}</h2>
        {note ? <span className="ui-label text-[11px]!">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children, status, note, check }: {
  label: string;
  children: React.ReactNode;
  status: React.ReactNode;
  note?: string;
  check?: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-x-3.5 gap-y-1.5 border-b border-white/[0.07] py-2.5 last:border-0 sm:grid-cols-[200px_1fr_130px_120px]">
      <span className="text-sm text-bone">{label}</span>
      <div>
        {children}
        {note ? <div className="mt-1 text-xs text-ash">{note}</div> : null}
      </div>
      <div>{status}</div>
      <div>{check}</div>
    </div>
  );
}

function RotationRow({ row }: { row: AdminRotationRow }) {
  const [value, setValue] = useState(row.value);
  const mismatch = row.status !== "learning" && value !== row.predicted;
  const progress =
    row.status === "learning"
      ? `${row.history.length ? row.history.join(" → ") + " → ?" : "No history yet"} · ${row.seen} of ${row.length} seen`
      : row.status === "confirmed"
        ? `${row.length}-week order confirmed`
        : `Pattern learned · expected ${row.predicted}`;
  return (
    <Row
      label={row.label}
      status={<Status kind={mismatch ? "mismatch" : row.status} />}
      note={mismatch ? `Expected ${row.predicted} · saving corrects the order` : progress}
      check={
        <label className="flex items-center gap-1.5 text-[12.5px] text-[#c7cad0]">
          <input type="checkbox" name={`seen:${row.key}`} defaultChecked={row.savedThisWeek} className="accent-[#4fbf73]" />
          Seen in game
        </label>
      }
    >
      <select name={`rotation:${row.key}`} value={value} onChange={(event) => setValue(event.target.value)} className={SELECT}>
        {row.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Row>
  );
}

function FeaturedRow({ label, name, options, value, fromAdmin, source }: {
  label: string;
  name: string;
  options: AdminSelectOption[];
  value: string | undefined;
  fromAdmin: boolean;
  source: string;
}) {
  return (
    <Row label={label} status={<Status kind={fromAdmin ? "admin" : "auto"} />} note={fromAdmin ? undefined : source}>
      <select name={name} defaultValue={value ?? ""} className={SELECT}>
        <option value="">— not detected yet —</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Row>
  );
}

export function AdminWeekForm(props: AdminWeekFormProps) {
  const [state, formAction, saving] = useActionState<AdminSaveState, FormData>(saveAdminWeek, null);
  const [resetState, setResetState] = useState<AdminSaveState>(null);
  const [resetting, startReset] = useTransition();
  const message = resetState ?? state;

  return (
    <form action={formAction}>
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="ui-label text-seasonal!">
            Admin · Week {props.week} · {props.dates}
          </div>
          <h1 className="mt-1.5 text-3xl font-semibold uppercase tracking-[0.06em] text-bone">This week</h1>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={resetting}
            onClick={() => startReset(async () => setResetState(await resetAdminWeek()))}
            className={`${BUTTON} border-white/30 text-[#c7cad0] hover:border-bone`}
          >
            Reset to automatic
          </button>
          <button type="submit" disabled={saving} className={`${BUTTON} border-seasonal bg-seasonal font-semibold text-void`}>
            {saving ? "Saving…" : "Save week"}
          </button>
        </div>
      </div>

      {message ? (
        <p
          className={`mb-3.5 border px-4 py-2.5 text-sm text-bone ${
            message.ok ? "border-[#4fbf73]/60 bg-[#4fbf73]/10" : "border-[#e07a3f]/60 bg-[#e07a3f]/10"
          }`}
        >
          {message.message}
        </p>
      ) : null}

      <Block title="Featured activities" note="Raids from Bungie ~30 min after reset · dungeons from Kyber">
        {[0, 1].map((index) => (
          <FeaturedRow
            key={`raid${index}`}
            label={`Raid ${index + 1}`}
            name={`raid${index + 1}`}
            options={props.raids}
            value={props.featuredRaids[index]}
            fromAdmin={props.featuredFromAdmin.raids}
            source="Detected from Bungie milestones"
          />
        ))}
        {[0, 1].map((index) => (
          <FeaturedRow
            key={`dungeon${index}`}
            label={`Dungeon ${index + 1}`}
            name={`dungeon${index + 1}`}
            options={props.dungeons}
            value={props.featuredDungeons[index]}
            fromAdmin={props.featuredFromAdmin.dungeons}
            source="From Kyber's Corner / confirmed schedule"
          />
        ))}
      </Block>

      {props.groups.map((group) => (
        <Block key={group.name} title={group.name}>
          {group.rows.map((row) => (
            <RotationRow key={row.key} row={row} />
          ))}
        </Block>
      ))}

      <p className="mt-1.5 text-[12.5px] text-ash">
        Saving updates the home page, destination pages and share kit right away. Picks last until the next reset;
        rotations marked “Seen in game” go into the history the site learns from.
      </p>
    </form>
  );
}
