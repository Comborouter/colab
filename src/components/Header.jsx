import { setInviteModalOpen } from "../store.js";
import WsBar from "./WsBar.jsx";
import UserMenu from "./UserMenu.jsx";

export default function Header() {
  return (
    <header class="border-b border-neutral-200">
      <div class="max-w-5xl mx-auto px-4 h-11 flex items-center gap-3">
        <WsBar />
        <span class="flex-1"></span>
        <button
          class="btn btn-xs"
          title="Invite member to this workspace"
          onClick={() => setInviteModalOpen(true)}
        >
          Invite
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
