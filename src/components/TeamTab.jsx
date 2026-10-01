import { For, Show, createSignal, createMemo } from "solid-js";
import { state, inviteModalOpen, setInviteModalOpen, workspaceInvitations, setWorkspaceInvitations } from "../store.js";
import { msg } from "../actions.js";

export default function TeamTab() {
  const ws = () => state.ws || {};

  const [activeTab, setActiveTab] = createSignal("all");
  const [searchQuery, setSearchQuery] = createSignal("");
  const invitations = workspaceInvitations;
  const setInvitations = setWorkspaceInvitations;
  const [columnsDropdownOpen, setColumnsDropdownOpen] = createSignal(false);

  // Column visibility
  const [colVisible, setColVisible] = createSignal({
    role: true,
    joined: true,
  });

  function fmtDate(raw) {
    if (!raw) return "—";
    const d = new Date(raw);
    if (!isNaN(d.getTime()))
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    return raw;
  }

  const memberList = createMemo(() => {
    const rawMembers = (ws().members || []);

    // Real workspace members only (owner included - synthesized by the API
    // when the workspace has no explicit owner membership row)
    return rawMembers.map((m, idx) => {
      const email = m.email || "";
      const id = m.user_id || "";
      const label = email ? email.split("@")[0] : "";
      const name = m.name || label || (m.role === "owner" ? "Owner" : id || "Member");
      return {
        id: id || "usr_" + idx,
        name: name,
        sub: email || id || "—",
        role: m.role || "member",
        joined: fmtDate(m.joined_at),
        avatarBg: idx % 3 === 0 ? "bg-amber-800" : idx % 3 === 1 ? "bg-emerald-600" : "bg-sky-600",
        initial: (name || "U").slice(0, 1).toUpperCase(),
      };
    });
  });

  const filteredMembers = createMemo(() => {
    const q = searchQuery().trim().toLowerCase();
    if (!q) return memberList();
    return memberList().filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.sub.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  });

  function handleInviteCreated(newInv) {
    setInvitations((prev) => [newInv, ...prev]);
  }

  function handleRevokeInvite(idx) {
    setInvitations((prev) => prev.filter((_, i) => i !== idx));
    msg("Invitation revoked");
  }

  return (
    <div class="space-y-5">
      {/* Top Header */}
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900">
          Users
        </h1>
      </div>

      {/* Tabs */}
      <div class="flex items-center gap-6 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          class={`pb-3 text-sm font-medium transition cursor-pointer ${
            activeTab() === "all"
              ? "border-b-2 border-neutral-900 text-neutral-900 font-semibold"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("invitations")}
          class={`pb-3 text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
            activeTab() === "invitations"
              ? "border-b-2 border-neutral-900 text-neutral-900 font-semibold"
              : "text-neutral-500 hover:text-neutral-900"
          }`}
        >
          <span>Invitations</span>
          <Show when={invitations().length > 0}>
            <span class="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
              {invitations().length}
            </span>
          </Show>
        </button>
      </div>

      {/* Controls Bar */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Search & Filter Tools */}
        <div class="flex items-center gap-2 flex-wrap">
          {/* Search Input */}
          <div class="relative w-64">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class="w-full rounded-lg border border-neutral-200 bg-white py-1.5 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-black/5"
            />
          </div>

          {/* Columns Dropdown */}
          <div class="relative">
            <button
              type="button"
              onClick={() => setColumnsDropdownOpen(!columnsDropdownOpen())}
              class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Columns</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <Show when={columnsDropdownOpen()}>
              <div class="absolute left-0 top-full mt-1.5 z-30 w-44 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg space-y-1">
                <label class="flex items-center gap-2 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colVisible().role}
                    onChange={(e) => setColVisible({ ...colVisible(), role: e.target.checked })}
                    class="rounded text-neutral-900"
                  />
                  <span>Role</span>
                </label>
                <label class="flex items-center gap-2 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colVisible().joined}
                    onChange={(e) => setColVisible({ ...colVisible(), joined: e.target.checked })}
                    class="rounded text-neutral-900"
                  />
                  <span>Joined</span>
                </label>
              </div>
            </Show>
          </div>

          {/* Filter Button */}
          <button
            type="button"
            class="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
            title="Filter users"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>

        {/* Right: Invite Button */}
        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          class="inline-flex items-center gap-1.5 rounded-lg bg-[#635BFF] hover:bg-[#5248EE] px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Invite</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div class="rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-4 py-3 text-xs text-neutral-600 flex items-center gap-2.5">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="shrink-0 text-neutral-500"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          Use this development instance for internal and test users. When you're ready to invite real users, create your production instance.
        </span>
      </div>

      {/* Tab: All Users */}
      <Show when={activeTab() === "all"}>
        <div class="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-neutral-100 bg-neutral-50/40 text-neutral-500 font-medium">
                  <th class="py-3 px-5 font-medium">Member</th>
                  <Show when={colVisible().role}>
                    <th class="py-3 px-4 font-medium">Role</th>
                  </Show>
                  <Show when={colVisible().joined}>
                    <th class="py-3 px-4 font-medium">
                      <span class="inline-flex items-center gap-1">
                        <span>Joined</span>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </th>
                  </Show>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 text-neutral-800">
                <For each={filteredMembers()}>
                  {(u) => (
                    <tr class="hover:bg-neutral-50/60 transition">
                      {/* User Column */}
                      <td class="py-3.5 px-5">
                        <div class="flex items-center gap-3">
                          <div
                            class={`h-8 w-8 rounded-full ${u.avatarBg} text-white font-semibold flex items-center justify-center text-xs shrink-0`}
                          >
                            {u.initial}
                          </div>
                          <div>
                            <div class="font-medium text-neutral-900 text-[13px]">
                              {u.name}
                            </div>
                            <div class="text-[11px] text-neutral-400">
                              {u.sub}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <Show when={colVisible().role}>
                        <td class="py-3.5 px-4 capitalize text-neutral-700">
                          <span
                            class={
                              u.role === "owner"
                                ? "inline-flex items-center rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-white"
                                : "inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 border border-neutral-200"
                            }
                          >
                            {u.role}
                          </span>
                        </td>
                      </Show>

                      {/* Joined Column */}
                      <Show when={colVisible().joined}>
                        <td class="py-3.5 px-4 text-neutral-600">
                          {u.joined}
                        </td>
                      </Show>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </Show>

      {/* Tab: Invitations */}
      <Show when={activeTab() === "invitations"}>
        <div class="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
          <Show
            when={invitations().length > 0}
            fallback={
              <div class="p-8 text-center space-y-3">
                <div class="h-10 w-10 rounded-full bg-neutral-100 text-neutral-500 mx-auto flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-neutral-900">No pending invitations</h3>
                <p class="text-xs text-neutral-500 max-w-sm mx-auto">
                  Generated invite links will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(true)}
                  class="rounded-lg bg-[#635BFF] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#5248EE] cursor-pointer"
                >
                  Invite user
                </button>
              </div>
            }
          >
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-neutral-100 bg-neutral-50/40 text-neutral-500 font-medium">
                  <th class="py-3 px-5">Recipient</th>
                  <th class="py-3 px-4">Role</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Created</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 text-neutral-800">
                <For each={invitations()}>
                  {(inv, idx) => (
                    <tr class="hover:bg-neutral-50/60 transition">
                      <td class="py-3 px-5 font-medium text-neutral-900">
                        {inv.email || "Anyone with the link"}
                      </td>
                      <td class="py-3 px-4 capitalize text-neutral-600">
                        {inv.role}
                      </td>
                      <td class="py-3 px-4">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          {inv.status || "Pending"}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-neutral-500">
                        {inv.created_at || "Just now"}
                      </td>
                      <td class="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.clipboard) navigator.clipboard.writeText(inv.url);
                            msg("Invite link copied to clipboard");
                          }}
                          class="rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                        >
                          Copy link
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevokeInvite(idx())}
                          class="rounded px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </Show>
        </div>
      </Show>
    </div>
  );
}
