import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import { profileOpen, setProfileOpen, state, isClerk } from "../store.js";
import { clerkSignOut } from "../clerk.js";
import { msg } from "../actions.js";

function cu() {
  return (window.Clerk && window.Clerk.user) || null;
}

function dispName() {
  const u = cu();
  if (u && (u.fullName || u.username)) return u.fullName || u.username;
  if (u && u.primaryEmailAddress && u.primaryEmailAddress.emailAddress)
    return u.primaryEmailAddress.emailAddress;
  return "Administrator";
}

function avatarUrl() {
  const u = cu();
  return (u && u.imageUrl) || "";
}

function initial() {
  return (dispName().trim().slice(0, 1) || "?").toUpperCase();
}

function openClerkProfile() {
  setProfileOpen(false);
  if (window.Clerk && cu()) {
    try {
      window.Clerk.openUserProfile();
      return;
    } catch (e) {}
  }
  msg("sign in with Clerk for full account management");
}

function signOut() {
  setProfileOpen(false);
  if (cu()) clerkSignOut();
  else location.href = "/logout";
}

function kebab() {
  return (
    <button class="text-neutral-400 hover:text-neutral-600 transition" onClick={openClerkProfile}>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="6" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="18" r="1" />
      </svg>
    </button>
  );
}

function clerkLink(label) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        openClerkProfile();
      }}
      class="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </a>
  );
}

function tabIcon(kind) {
  const paths = {
    profile:
      "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    security:
      "M8 11V7a4 4 0 018 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z",
    prefs:
      "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  };
  return (
    <svg
      class="w-4 h-4"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d={paths[kind]} />
    </svg>
  );
}

export default function ProfileModal() {
  const [tab, setTab] = createSignal("profile");
  onMount(function () {
    const esc = function (e) {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("keydown", esc);
    onCleanup(function () {
      document.removeEventListener("keydown", esc);
    });
  });
  const ws = () => state.ws || {};
  const emails = () => {
    const u = cu();
    return (u && u.emailAddresses) || [];
  };
  const primaryId = () => {
    const u = cu();
    return (u && u.primaryEmailAddressId) || "";
  };
  const phones = () => {
    const u = cu();
    return (u && u.phoneNumbers) || [];
  };
  const extAccounts = () => {
    const u = cu();
    return (u && u.externalAccounts) || [];
  };
  const via = () => {
    const u = cu();
    if (!u) return "Dashboard password (dev only)";
    const ext = extAccounts();
    if (ext.length && ext[0].provider) return "SSO (" + ext[0].provider + ")";
    return "Email";
  };
  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      class={
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition " +
        (tab() === id
          ? "bg-neutral-100 text-neutral-900"
          : "text-neutral-600 hover:bg-neutral-50")
      }
    >
      <span class={tab() === id ? "text-indigo-500" : "text-neutral-400"}>
        {tabIcon(id === "prefs" ? "prefs" : id)}
      </span>
      {label}
    </button>
  );
  return (
    <Show when={profileOpen()}>
      <div
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) setProfileOpen(false);
        }}
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-[fadeSlide_0.25s_ease]"
        >
          <div class="flex h-[600px]">
            <aside class="w-[220px] flex-shrink-0 border-r border-neutral-200 p-5 flex flex-col">
              <h2 class="text-base font-semibold text-neutral-900 leading-tight">Account</h2>
              <p class="text-[13px] text-neutral-500 mt-1 mb-5">Manage your account info.</p>
              <nav class="space-y-0.5 flex-1">
                {tabBtn("profile", "Profile")}
                {tabBtn("security", "Security")}
                {tabBtn("prefs", "Preferences")}
              </nav>
              <div class="border-t border-neutral-100 pt-4 mt-auto">
                <span class="text-[12px] text-neutral-500 flex items-center gap-1">
                  Secured by
                  <span class="text-[12px] font-bold text-neutral-700 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#6366f1">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    clerk
                  </span>
                </span>
              </div>
            </aside>
            <section class="flex-1 flex flex-col overflow-y-auto">
              <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                <h3 class="text-sm font-semibold text-neutral-900">
                  {tab() === "profile"
                    ? "Profile details"
                    : tab() === "security"
                      ? "Security"
                      : "Preferences"}
                </h3>
                <button
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition"
                  onClick={() => setProfileOpen(false)}
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div class="px-6 py-2 space-y-0.5">
                <Show when={tab() === "profile"}>
                  <div class="flex items-center justify-between py-4 border-b border-neutral-100">
                    <span class="text-sm text-neutral-700 font-medium">Profile</span>
                    <div class="flex items-center gap-3">
                      <Show
                        when={avatarUrl()}
                        fallback={
                          <span class="w-10 h-10 rounded-full bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                            {initial()}
                          </span>
                        }
                      >
                        <img
                          src={avatarUrl()}
                          alt="avatar"
                          class="w-10 h-10 rounded-full object-cover"
                        />
                      </Show>
                      <span class="text-sm font-medium text-neutral-900">{dispName()}</span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          openClerkProfile();
                        }}
                        class="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                      >
                        Update profile
                      </a>
                    </div>
                  </div>
                  <div class="py-4 border-b border-neutral-100">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm text-neutral-700 font-medium">Email addresses</span>
                      {kebab()}
                    </div>
                    <Show
                      when={emails().length}
                      fallback={<div class="hint">no emails on this login</div>}
                    >
                      <For each={emails()}>
                        {(m) => (
                          <div class="bg-neutral-50 rounded-lg px-4 py-2.5 flex items-center justify-between text-sm mb-1.5 last:mb-0">
                            <span class="text-neutral-700">{m.emailAddress}</span>
                            <Show when={m.id === primaryId()}>
                              <span class="text-[11px] font-medium text-neutral-500 bg-white border border-neutral-200 px-2 py-0.5 rounded-full">
                                Primary
                              </span>
                            </Show>
                          </div>
                        )}
                      </For>
                    </Show>
                    {clerkLink("Add email address")}
                  </div>
                  <div class="py-4 border-b border-neutral-100">
                    <span class="text-sm text-neutral-700 font-medium mb-2 block">
                      Phone numbers
                    </span>
                    <Show
                      when={phones().length}
                      fallback={<div class="hint">no phone numbers on this login</div>}
                    >
                      <For each={phones()}>
                        {(p) => (
                          <div class="bg-neutral-50 rounded-lg px-4 py-2.5 text-sm text-neutral-700 mb-1.5 last:mb-0">
                            {p.phoneNumber}
                          </div>
                        )}
                      </For>
                    </Show>
                    {clerkLink("Add phone number")}
                  </div>
                  <div class="py-4">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm text-neutral-700 font-medium">
                        Connected accounts
                      </span>
                    </div>
                    <Show
                      when={extAccounts().length}
                      fallback={
                        <div class="hint">no connected social accounts on this login</div>
                      }
                    >
                      <For each={extAccounts()}>
                        {(a) => (
                          <div class="flex items-center justify-between py-2.5 px-4 rounded-lg hover:bg-neutral-50 transition">
                            <div class="flex items-center gap-3">
                              <span class="w-5 h-5 rounded-full bg-neutral-200 text-neutral-600 text-[10px] font-bold flex items-center justify-center">
                                {(String(a.provider || "?").slice(0, 1) || "?").toUpperCase()}
                              </span>
                              <span class="text-sm text-neutral-700">
                                {a.provider +
                                  " · " +
                                  (a.emailAddress || a.username || "")}
                              </span>
                            </div>
                            {kebab()}
                          </div>
                        )}
                      </For>
                    </Show>
                    {clerkLink("Connect account")}
                  </div>
                </Show>
                <Show when={tab() === "security"}>
                  <div class="flex items-center justify-between py-4 border-b border-neutral-100">
                    <span class="text-sm text-neutral-700 font-medium">Signed in via</span>
                    <span class="text-sm text-neutral-900">{via()}</span>
                  </div>
                  <div class="flex items-center justify-between py-4 border-b border-neutral-100">
                    <span class="text-sm text-neutral-700 font-medium">Workspace</span>
                    <span class="text-sm text-neutral-900">
                      {(ws().name || ws().id || "—") + " · " + (ws().role || "member")}
                    </span>
                  </div>
                  <div class="py-4">
                    <button class="btn btn-xs" onClick={signOut}>
                      Sign out
                    </button>
                  </div>
                </Show>
                <Show when={tab() === "prefs"}>
                  <div class="py-8 text-center">
                    <p class="text-sm text-neutral-500">No preferences yet.</p>
                    <p class="hint mt-1">Display and notification options will live here.</p>
                  </div>
                </Show>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Show>
  );
}
