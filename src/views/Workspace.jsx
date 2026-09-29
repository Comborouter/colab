import { For, Show, createSignal, createEffect } from "solid-js";
import { state, setRoute, refs } from "../store.js";
import { wsShare, wsRename, wsSaveLogo } from "../actions.js";
import Header from "../components/Header.jsx";
import WsLogo from "../components/WsLogo.jsx";
import LogoPicker from "../components/LogoPicker.jsx";

export default function Workspace() {
  const ws = () => state.ws || {};
  const members = () => ws().members || [];
  const [logoData, setLogoData] = createSignal(null);
  let lastWs = "";
  createEffect(() => {
    const w = state.ws || {};
    if ((w.id || "") !== lastWs) {
      lastWs = w.id || "";
      setLogoData(null);
    }
    if (logoData() === null && w.logo) setLogoData(w.logo);
  });
  return (
    <>
      <Header />
      <main class="max-w-5xl mx-auto px-4 pb-6 space-y-3">
        <div class="flex items-center gap-2 pt-2">
          <button class="btn btn-xs" onClick={() => setRoute("dash")}>
            ← back
          </button>
          <span class="mono text-[11px] text-neutral-500">
            dashboard / workspace / {ws().name || ws().id || "—"}
          </span>
        </div>
        <section class="border border-neutral-200 rounded-lg">
          <div class="px-3.5 py-2 border-b border-neutral-200">
            <span class="ph">current workspace</span>
          </div>
          <div class="p-3.5 space-y-1">
            <div class="text-[13px] font-medium">{ws().name || "—"}</div>
            <div class="mono text-[10px] text-neutral-500">
              {(ws().role || "member") + " · " + (ws().id || "—")}
            </div>
            <div class="flex items-center gap-2 pt-2">
              <WsLogo logo={ws().logo} name={ws().name || ws().id} size={28} />
              <LogoPicker
                value={logoData() || ""}
                name={ws().name || ws().id}
                onChange={setLogoData}
              />
              <Show when={logoData() !== null && logoData() !== (ws().logo || "")}>
                <button class="btn btn-xs" onClick={() => wsSaveLogo(logoData() || "")}>
                  save logo
                </button>
              </Show>
            </div>
            <div class="flex gap-1.5 flex-wrap items-center pt-1">
              <input
                type="text"
                placeholder="rename workspace"
                maxlength="40"
                class="inp flex-1 py-0.5 text-[11px]"
                ref={(el) => (refs.wsRename = el)}
              />
              <button class="btn btn-xs" onClick={wsRename}>
                rename
              </button>
            </div>
          </div>
        </section>
        <section class="border border-neutral-200 rounded-lg">
          <div class="px-3.5 py-2 border-b border-neutral-200">
            <span class="ph">members</span>
          </div>
          <div class="p-3.5 space-y-1">
            <Show
              when={members().length}
              fallback={<div class="hint">no members yet</div>}
            >
              <For each={members()}>
                {(m) => (
                  <div class="flex items-center gap-2 text-xs py-0.5">
                    <span class="flex-1 truncate">
                      {(m && (m.email || m.user_id)) || "unknown"}
                    </span>
                    <span class="mono text-[10px] text-neutral-400">
                      {(m && m.role) || "member"}
                    </span>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </section>
        <section class="border border-neutral-200 rounded-lg">
          <div class="px-3.5 py-2 border-b border-neutral-200">
            <span class="ph">add members</span>
          </div>
          <div class="p-3.5 space-y-2">
            <button class="btn btn-xs" onClick={wsShare}>
              invite / share
            </button>
            <p class="hint">invite links work for Google/email (Clerk) sign-ins</p>
          </div>
        </section>
      </main>
    </>
  );
}
