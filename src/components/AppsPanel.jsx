import { For, Show, createMemo } from "solid-js";
import { state, appStates, pickEp, openMenu } from "../store.js";
import { openMarket, appMore, runOnMachines, appDelete } from "../actions.js";
import SessPills from "./SessPills.jsx";

export default function AppsPanel() {
  const apps = () => state.apps || [];
  const ep = () => pickEp();
  const stMap = () => {
    const e = ep();
    return e ? appStates[e] : null;
  };
  const installed = createMemo(() => {
    const m = stMap();
    if (!m) return null;
    return apps().filter(function (a) {
      const s = m[a.name];
      return s && (s.installed || s.installing || s.running || s.failed);
    });
  });
  const anyRunning = createMemo(() => {
    const list = installed();
    const m = stMap();
    if (!list || !list.length || !m) return false;
    return list.some(function (a) {
      const s = m[a.name];
      return !!(s && s.running);
    });
  });
  return (
    <section class="border border-neutral-200 rounded-lg">
      <Show
        when={anyRunning()}
        fallback={
          <div class="flex justify-center py-8">
            <button class="btn btn-p px-6 py-2.5" onClick={openMarket}>
              marketplace
            </button>
          </div>
        }
      >
      <div class="flex items-center gap-2 px-3.5 py-2 border-b border-neutral-200 flex-wrap">
        <span class="ph"></span>
        <span class="flex-1"></span>
        <button class="btn btn-xs" onClick={openMarket}>
          marketplace
        </button>
      </div>
      <div class="px-3.5 py-2 border-b border-neutral-100 flex items-center gap-2 flex-wrap">
        <span class="hint">on vm:</span>
        <span class="flex items-center gap-1.5 flex-wrap">
          <SessPills />
        </span>
      </div>
      <div class="p-1">
        <For each={installed()}>
                {(a) => {
                  const mf = a.meta || {};
                  const st = () => {
                    const m = stMap();
                    return (m && m[a.name]) || {};
                  };
                  const isExt = mf.type === "extension";
                  return (
                    <>
                      <div class="flex items-center gap-2 px-2.5 py-1.5 border-b border-neutral-100 last:border-0 text-xs flex-wrap">
                        <span class="min-w-0 flex-1">
                          <span class="font-medium">{mf.title || a.name}</span>{" "}
                          <span class="mono text-[10px] text-neutral-400">
                            {mf.version || "v?"}
                          </span>
                          <Show when={mf.description}>
                            <div class="text-[11px] text-neutral-500 truncate">
                              {mf.description}
                            </div>
                          </Show>
                        </span>
                        <span>
                          <Show
                            when={st().failed}
                            fallback={
                              <Show
                                when={st().installing}
                                fallback={
                                  <Show
                                    when={st().running}
                                    fallback={
                                      <span class="mono text-[10px] text-neutral-500">
                                        installed
                                      </span>
                                    }
                                  >
                                    <span class="mono text-[10px] text-green-600">running</span>
                                  </Show>
                                }
                              >
                                <span class="mono text-[10px] text-neutral-500">installing…</span>
                              </Show>
                            }
                          >
                            <span class="mono text-[10px] font-semibold text-red-600">
                              failed
                            </span>
                          </Show>
                        </span>
                        <span class="flex gap-1">
                          <Show when={st().running && st().url}>
                            <a
                              class="btn btn-xs btn-p"
                              href={st().url}
                              target="_blank"
                              rel="noopener"
                            >
                              open ↗
                            </a>
                          </Show>
                          <Show when={!isExt && st().running}>
                            <button
                              class="btn btn-xs"
                              onClick={(e) => runOnMachines("stop", a.name, e.currentTarget)}
                            >
                              stop
                            </button>
                          </Show>
                          <Show when={!isExt && !st().running && st().installed}>
                            <button
                              class="btn btn-xs"
                              onClick={(e) => runOnMachines("launch", a.name, e.currentTarget)}
                            >
                              run
                            </button>
                          </Show>
                          <Show when={!isExt && st().failed && !st().installed}>
                            <button
                              class="btn btn-xs"
                              onClick={(e) => runOnMachines("install", a.name, e.currentTarget)}
                            >
                              retry
                            </button>
                          </Show>
                          <button
                            class="btn btn-xs"
                            title="more actions"
                            onClick={() => appMore(a.name)}
                          >
                            ⋯
                          </button>
                        </span>
                      </div>
                      <Show when={openMenu() === a.name}>
                        <div class="px-2.5 py-1.5 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
                          <span class="hint">registry:</span>
                          <button
                            class="btn btn-xs"
                            onClick={(e) => appDelete(a.name, e.currentTarget)}
                          >
                            remove from registry
                          </button>
                          <span class="hint">v{mf.version || "?"}</span>
                        </div>
                      </Show>
                    </>
                  );
                }}
               </For>
        </div>
      </Show>
    </section>
  );
}
