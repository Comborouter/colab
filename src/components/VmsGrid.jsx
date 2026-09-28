import { For, Show } from "solid-js";
import {
  aliveSessions,
  deadCount,
  isAdmin,
  refreshTick,
  pickEp,
  lsSet,
} from "../store.js";
import { fmtDur, shortEp } from "../api.js";
import { openNS, pickEpStore, renameSess, stopSess, viewLog, showTab } from "../actions.js";

function statRow(k, v) {
  return (
    <div class="flex justify-between gap-2">
      <span class="text-neutral-400">{k}</span>
      <span class="mono text-[10px] text-neutral-700 text-right">{v}</span>
    </div>
  );
}

function VmCard(props) {
  const r = () => props.r;
  const age = () => {
    refreshTick();
    return fmtDur(Date.now() - Date.parse(r().first_seen));
  };
  const hb = () => {
    refreshTick();
    return r().last_ok ? fmtDur(Date.now() - Date.parse(r().last_ok)) + " ago" : "—";
  };
  const stTxt = () => {
    const st = r().last_status;
    const ok = st === 0 || (st >= 200 && st < 400);
    return ok ? "ok" : "http " + st;
  };
  const sel = () => r().endpoint === pickEp();
  return (
    <div class="card" style={sel() ? "border-color:#171717" : ""}>
      <div class="flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-neutral-500 shrink-0"
        >
          <rect x="2" y="4" width="20" height="13" rx="2"></rect>
          <path d="M8 21h8M12 17v4"></path>
        </svg>
        <button
          class="text-[13px] font-medium hover:underline truncate"
          onClick={() => renameSess(r().endpoint, r().name || "")}
        >
          {r().name || shortEp(r().endpoint)}
        </button>
        <span class="flex-1"></span>
        <span class="pill">running</span>
      </div>
      <div class="mono text-[10px] text-neutral-500 truncate">
        {shortEp(r().endpoint)} · {r().accelerator || "?"}
        {r().machine_shape && r().machine_shape !== "STANDARD" ? " · high-mem" : ""}
      </div>
      <div class="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {statRow("uptime", age())}
        {statRow("heartbeat", hb())}
        {statRow("status", stTxt())}
        {statRow("account", (r().profile || "—").split("@")[0])}
      </div>
      <div class="flex gap-1.5 mt-auto">
        <Show when={r().proxy_url}>
          <a class="btn btn-xs" href={r().proxy_url} target="_blank" rel="noopener">
            open proxy
          </a>
        </Show>
        <button
          class="btn btn-xs"
          title="manage apps on this vm"
          onClick={() => pickEpStore(r().endpoint)}
        >
          apps
        </button>
        <span class="flex-1"></span>
        <button class="btn btn-xs" title="session log" onClick={() => viewLog(r().endpoint)}>
          log
        </button>
        <button class="btn btn-xs" onClick={() => stopSess(r().endpoint)}>
          stop
        </button>
      </div>
    </div>
  );
}

export default function VmsGrid() {
  return (
    <section class="border border-neutral-200 rounded-lg">
      <div class="flex items-center justify-between px-3.5 py-2 border-b border-neutral-200">
        <span class="ph">
          virtual machines{" "}
          <span class="mono normal-case font-normal text-neutral-400">
            {aliveSessions().length ? "\u00b7 " + aliveSessions().length + " running" : ""}
          </span>
        </span>
        <button class="btn btn-xs btn-p" onClick={() => openNS(null)}>
          + new session
        </button>
      </div>
      <div
        class="p-3 grid gap-2.5"
        style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))"
      >
        <Show
          when={aliveSessions().length}
          fallback={
            <div class="hint col-span-full flex items-center gap-2 p-2">
              no virtual machines{" "}
              <button class="btn btn-xs btn-p" onClick={() => openNS(null)}>
                create one
              </button>
            </div>
          }
        >
          <For each={aliveSessions()}>{(r) => <VmCard r={r} />}</For>
        </Show>
      </div>
      <Show when={deadCount() > 0 && isAdmin()}>
        <div class="px-3.5 py-1.5 border-t border-neutral-100">
          {deadCount()} dead vms — see{" "}
          <button class="underline" onClick={() => showTab("history")}>
            history
          </button>
        </div>
      </Show>
    </section>
  );
}
