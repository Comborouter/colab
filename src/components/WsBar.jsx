import { For, createEffect } from "solid-js";
import { state, isClerk, wsPopOpen, setWsPopOpen, setCreateWsOpen, setRoute } from "../store.js";
import { wsSwitch } from "../actions.js";
import { wsEmailBootstrap } from "../clerk.js";
import WsLogo from "./WsLogo.jsx";
import CreateWorkspaceModal from "./CreateWorkspaceModal.jsx";

export default function WsBar() {
  createEffect(() => {
    if (isClerk()) wsEmailBootstrap();
  });
  const ws = () => state.ws || {};
  const memberships = () => ws().memberships || [];
  return (
    <span class="relative">
      <button
        class="flex items-center gap-1.5 border border-neutral-200 rounded-lg pl-1 pr-1.5 py-0.5 hover:border-neutral-400"
        onClick={() => setWsPopOpen(!wsPopOpen())}
      >
        <WsLogo logo={ws().logo} name={ws().name || ws().id} size={20} />
        <span class="text-[13px] font-medium truncate" style="max-width:140px">
          {ws().name || ws().id || "workspace"}
        </span>
        <span class="text-[9px] font-semibold uppercase border border-neutral-200 text-neutral-500 rounded-full px-1.5 py-px">
          {ws().role || "member"}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 shrink-0">
          <path d="M8 9l4-4 4 4M8 15l4 4 4-4"></path>
        </svg>
      </button>
      <div
        class="absolute left-0 top-8 z-50 w-72 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 divide-y divide-neutral-100"
        classList={{ hidden: !wsPopOpen() }}
      >
        <div class="flex items-center gap-2.5 px-2 py-1.5">
          <WsLogo logo={ws().logo} name={ws().name || ws().id} size={28} />
          <span class="min-w-0 flex-1">
            <span class="block text-[13px] font-medium truncate">
              {ws().name || ws().id || "—"}
            </span>
            <span class="block text-[11px] text-neutral-500 capitalize">
              {ws().role || "member"}
            </span>
          </span>
          <button
            class="btn btn-xs"
            onClick={() => {
              setWsPopOpen(false);
              setRoute("workspace");
            }}
          >
            Manage
          </button>
        </div>
        <For
          each={memberships().filter(function (ms) {
            return ms.wsid !== ws().id;
          })}
        >
          {(ms) => (
            <button
              class="flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100"
              onClick={() => wsSwitch(ms.wsid)}
            >
              <WsLogo logo={ms.logo} name={ms.name || ms.wsid} size={28} />
              <span class="text-[13px] truncate">{ms.name || ms.wsid}</span>
            </button>
          )}
        </For>
        <button
          class="flex items-center gap-2.5 w-full text-left px-2 py-1.5 rounded-lg hover:bg-neutral-100"
          onClick={() => {
            setWsPopOpen(false);
            setCreateWsOpen(true);
          }}
        >
          <span class="flex items-center justify-center w-7 h-7 rounded-full border border-dashed border-neutral-400 text-neutral-500 text-base leading-none shrink-0">
            +
          </span>
          <span class="text-[13px] text-neutral-600">Create workspace</span>
        </button>
      </div>
      <CreateWorkspaceModal />
    </span>
  );
}
