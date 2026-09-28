import { For, Show, createEffect } from "solid-js";
import { state, isClerk, wsPopOpen, setWsPopOpen } from "../store.js";
import { wsShare, wsSwitch } from "../actions.js";
import { wsEmailBootstrap } from "../clerk.js";

export default function WsBar() {
  createEffect(() => {
    if (isClerk()) wsEmailBootstrap();
  });
  return (
    <span class="relative">
      <Show when={isClerk()}>
        <button
          class="hint"
          style="max-width:340px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
          onClick={() => setWsPopOpen(!wsPopOpen())}
        >
          {(state.ws && state.ws.name) || "workspace"} ·{" "}
          {(state.ws && state.ws.role) || "member"} ·{" "}
          {String(((state.ws && state.ws.members) || []).length)} member(s)
        </button>
        <div
          class="absolute left-0 top-8 z-50 w-72 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 space-y-2"
          classList={{ hidden: !wsPopOpen() }}
        >
          <div class="ph">members</div>
          <For each={(state.ws && state.ws.members) || []}>
            {(m) => (
              <div class="flex items-center gap-2 text-xs py-0.5">
                <span class="flex-1 truncate">{m.email || m}</span>
                <span class="mono text-[10px] text-neutral-400">{m.role || "member"}</span>
              </div>
            )}
          </For>
          <Show when={((state.ws && state.ws.memberships) || []).length > 1}>
            <div class="flex items-center gap-2 text-xs pt-1.5 mt-1.5 border-t border-neutral-100">
              <span class="hint">switch:</span>
              <select
                class="inp py-0.5 text-[11px] flex-1"
                value={(state.ws && state.ws.id) || ""}
                onChange={(e) => wsSwitch(e.currentTarget.value)}
              >
                <For each={(state.ws && state.ws.memberships) || []}>
                  {(ms) => <option value={ms.wsid}>{ms.name || ms.wsid}</option>}
                </For>
              </select>
            </div>
          </Show>
          <button class="btn btn-xs mt-2 w-full" onClick={wsShare}>
            invite / share
          </button>
        </div>
      </Show>
    </span>
  );
}
