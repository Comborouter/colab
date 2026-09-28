import { Show } from "solid-js";
import { isAdmin, isClerk, sessOpen } from "../store.js";
import { toggleSessPanel, wsShare } from "../actions.js";
import { clerkSignOut } from "../clerk.js";
import WsBar from "./WsBar.jsx";

export default function Header() {
  return (
    <header class="border-b border-neutral-200">
      <div class="max-w-5xl mx-auto px-4 h-11 flex items-center gap-3">
        <h1 class="text-sm font-semibold tracking-tight">colab-cli</h1>
        <WsBar />
        <span class="flex-1"></span>
        <Show when={isAdmin()}>
          <button
            class="btn btn-xs"
            classList={{ "btn-p": sessOpen() }}
            onClick={() => toggleSessPanel()}
          >
            logs
          </button>
        </Show>
        <Show when={isClerk()}>
          <button
            class="btn btn-xs"
            title="copy an invite link to this workspace"
            onClick={wsShare}
          >
            share
          </button>
          <button class="btn btn-xs" onClick={clerkSignOut}>
            sign out
          </button>
        </Show>
        <a href="/logout" class="text-[11px] text-neutral-500 hover:text-neutral-900">
          logout
        </a>
      </div>
    </header>
  );
}
