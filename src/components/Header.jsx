import { Show } from "solid-js";
import { isAdmin, sessOpen } from "../store.js";
import { toggleSessPanel, wsShare } from "../actions.js";
import WsBar from "./WsBar.jsx";
import UserMenu from "./UserMenu.jsx";

export default function Header() {
  return (
    <header class="border-b border-neutral-200">
      <div class="max-w-5xl mx-auto px-4 h-11 flex items-center gap-3">
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
        <button
          class="btn btn-xs"
          title="copy an invite link to this workspace"
          onClick={wsShare}
        >
          Invite
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
