import { For, Show } from "solid-js";
import { aliveSessions, state, appStates, refreshTick } from "../store.js";
import { shortEp } from "../api.js";
import { setVmModal } from "../store.js";

const TILE_COLORS = [
  "bg-lime-600",
  "bg-blue-600",
  "bg-amber-500",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-500",
];

function tileColor(name) {
  let h = 0;
  const s = String(name || "?");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return TILE_COLORS[h % TILE_COLORS.length];
}

function hms(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return (
    h + ":" + String(m).padStart(2, "0") + ":" + String(ss).padStart(2, "0")
  );
}

export default function OverviewTab() {
  const rows = () => {
    refreshTick();
    const out = [];
    const apps = state.apps || [];
    aliveSessions().forEach(function (r) {
      const m = appStates[r.endpoint];
      if (!m) return;
      apps.forEach(function (a) {
        const s = m[a.name];
        if (s && s.running) out.push({ app: a, ep: r.endpoint, vm: r, st: s });
      });
    });
    return out;
  };
  const tokenMins = () => {
    refreshTick();
    const a = state.auth || {};
    if (!a.hasTokens || !a.expiry) return null;
    return Math.max(0, Math.round((a.expiry - Date.now()) / 60000));
  };
  const notice = () => {
    const bits = [];
    const nv = aliveSessions().length;
    bits.push(nv ? nv + " virtual machine" + (nv === 1 ? "" : "s") + " running" : "no virtual machines running");
    const na = rows().length;
    bits.push(na ? na + " app" + (na === 1 ? "" : "s") + " running" : "no apps running");
    const tm = tokenMins();
    if (tm !== null) bits.push("colab token " + tm + "m");
    return bits.join(" · ");
  };
  return (
    <div class="space-y-5">
      <Show
        when={aliveSessions().length}
        fallback={
          <div class="border border-neutral-200 rounded-xl p-5 text-sm text-neutral-500">
            No virtual machines yet — hit New Session above to create one.
          </div>
        }
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <For each={aliveSessions()}>
            {(r) => (
              <div class="border border-neutral-200 rounded-xl p-5 flex flex-col hover:shadow-md hover:border-neutral-300 transition">
                <div class="w-9 h-9 mb-5 text-neutral-700">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    viewBox="0 0 24 24"
                  >
                    <rect x="2" y="4" width="20" height="13" rx="2"></rect>
                    <path d="M8 21h8M12 17v4"></path>
                  </svg>
                </div>
                <h3 class="font-semibold text-[15px] mb-2">{r.name || "Colab VM"}</h3>
                <p class="text-[13px] leading-relaxed text-neutral-500 flex-1">
                  Colab · {r.accelerator || "CPU"}
                </p>
                <p class="text-[13px] leading-relaxed text-neutral-500 flex-1">Online</p>
                <button
                  class="mt-5 self-start inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium hover:bg-neutral-50 transition"
                  onClick={() => setVmModal(r.endpoint)}
                >
                  Configure
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>
      <div class="flex items-center gap-2.5 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-[13px] text-neutral-600">
        <svg
          class="w-4 h-4 text-neutral-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="9" />
          <path stroke-linecap="round" d="M12 8h.01M11 12h1v4h1" />
        </svg>
        <span>{notice()}</span>
      </div>
      <Show when={rows().length}>
        <div class="border border-neutral-200 rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-neutral-50/70 text-left text-[13px] text-neutral-500 border-b border-neutral-200">
                <th class="px-5 py-3 font-medium">Application</th>
                <th class="px-5 py-3 font-medium">VM</th>
                <th class="px-5 py-3 font-medium">Runtime</th>
                <th class="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              <For each={rows()}>
                {(row) => {
                  const mf = row.app.meta || {};
                  const title = mf.title || row.app.name;
                  const vmName =
                    (row.vm && row.vm.name) || shortEp(row.ep);
                  const rt = row.st.since
                    ? hms(Date.now() - row.st.since)
                    : "—";
                  return (
                    <tr class="hover:bg-neutral-50/60 transition">
                      <td class="px-5 py-3.5">
                        <div class="flex items-center gap-3">
                          <div
                            class={
                              "w-9 h-9 rounded-lg text-white text-sm font-semibold flex items-center justify-center flex-shrink-0 " +
                              tileColor(row.app.name)
                            }
                          >
                            {title.trim().slice(0, 1).toUpperCase()}
                          </div>
                          <div class="leading-tight">
                            <div class="font-medium text-neutral-900">{title}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-5 py-3.5 text-neutral-600">{vmName}</td>
                      <td class="px-5 py-3.5 text-neutral-600 mono">{rt}</td>
                      <td class="px-5 py-3.5 text-neutral-600">
                        <Show
                          when={row.st.url}
                          fallback={<span class="hint">starting…</span>}
                        >
                          <a
                            class="inline-flex items-center px-3.5 py-2 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium hover:bg-neutral-50 transition"
                            href={row.st.url}
                            target="_blank"
                            rel="noopener"
                          >
                            Open
                          </a>
                        </Show>
                      </td>
                    </tr>
                  );
                }}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </div>
  );
}
