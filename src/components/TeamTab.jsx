import { For, Show } from "solid-js";
import { state } from "../store.js";
import { wsShare } from "../actions.js";

export default function TeamTab() {
  const ws = () => state.ws || {};
  const members = () => ws().members || [];
  return (
    <div class="space-y-5">
      <section class="border border-neutral-200 rounded-xl overflow-hidden">
        <div class="px-5 py-3 border-b border-neutral-200">
          <span class="ph">members · {ws().name || ws().id || "—"}</span>
        </div>
        <div class="p-3">
          <Show when={members().length} fallback={<div class="hint p-2">no members yet</div>}>
            <For each={members()}>
              {(m) => (
                <div class="flex items-center gap-3 px-2 py-2 text-sm">
                  <span class="flex-1 truncate text-neutral-800">
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
      <button
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium hover:bg-neutral-50 transition"
        onClick={wsShare}
      >
        Invite member
      </button>
    </div>
  );
}
