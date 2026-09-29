import { For, Show, createMemo } from "solid-js";
import {
  state,
  sessOpen,
  viewTab,
  effViewEp,
  aliveSessions,
  refs,
  setViewEp,
  dashTab,
} from "../store.js";
import { shortEp } from "../api.js";
import { toggleSessPanel, showTab } from "../actions.js";

export default function SessionPanel() {
  const list = createMemo(() => {
    const all = state.events || [];
    if (viewTab() === "log") {
      const ep = effViewEp();
      return ep ? all.filter(function (e) { return e.endpoint === ep; }) : [];
    }
    return all;
  });
  return (
    <Show when={sessOpen() || dashTab() === "logs"}>
      <div class="space-y-3">
        <section class="border border-neutral-200 rounded-lg">
          <div class="flex items-center gap-1.5 px-3 py-1.5 border-b border-neutral-200">
            <button
              class="tab"
              classList={{ on: viewTab() === "log" }}
              onClick={() => showTab("log")}
            >
              session log
            </button>
            <button
              class="tab"
              classList={{ on: viewTab() === "history" }}
              onClick={() => showTab("history")}
            >
              history
            </button>
            <span class="flex-1"></span>
            <Show when={viewTab() === "log"}>
              <select
                class="inp py-1"
                style="max-width:230px"
                value={effViewEp()}
                onChange={(e) => setViewEp(e.currentTarget.value)}
              >
                <Show
                  when={aliveSessions().length}
                  fallback={<option value="">(no live session)</option>}
                >
                  <For each={aliveSessions()}>
                    {(r) => (
                      <option value={r.endpoint}>
                        {r.name || shortEp(r.endpoint)} · {(r.profile || "").split("@")[0]}
                      </option>
                    )}
                  </For>
                </Show>
              </select>
            </Show>
            <a href="/events" target="_blank" class="hint underline">
              raw
            </a>
            <button class="btn btn-xs" onClick={() => toggleSessPanel()}>
              close
            </button>
          </div>
          <div
            class="mono text-[11px] p-3 max-h-72 overflow-y-auto"
            ref={(el) => (refs.events = el)}
          >
            <Show
              when={list().length}
              fallback={
                <p class="hint">
                  {viewTab() === "log" ? "no events for this session yet" : "no events yet"}
                </p>
              }
            >
              <For each={list()}>
                {(e) => {
                  const err = () => /error|dead|fail|terminated/.test(e.kind);
                  return (
                    <div class="flex gap-3 py-0.5 border-b border-neutral-100 last:border-0">
                      <span class="text-neutral-400 shrink-0">{(e.ts || "").slice(11, 19)}</span>
                      <span
                        class="shrink-0"
                        classList={{ "font-semibold": err(), "text-neutral-700": !err() }}
                      >
                        {e.kind}
                      </span>
                      <Show when={viewTab() === "history"}>
                        <span class="text-neutral-400 shrink-0">{e.endpoint || ""}</span>
                      </Show>
                      <span class="text-neutral-600 truncate">{e.detail || ""}</span>
                    </div>
                  );
                }}
              </For>
            </Show>
          </div>
        </section>
      </div>
    </Show>
  );
}
