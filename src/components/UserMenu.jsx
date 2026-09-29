import { Show, onMount, onCleanup } from "solid-js";
import { isClerk, userMenuOpen, setUserMenuOpen, setProfileOpen } from "../store.js";
import { clerkSignOut } from "../clerk.js";
import { logout } from "../api.js";

function cu() {
  return (window.Clerk && window.Clerk.user) || null;
}

function dispName() {
  const u = cu();
  if (u && (u.fullName || u.username)) return u.fullName || u.username;
  if (u && u.primaryEmailAddress && u.primaryEmailAddress.emailAddress)
    return u.primaryEmailAddress.emailAddress;
  return isClerk() ? "Clerk user" : "Administrator";
}

function dispSub() {
  const u = cu();
  if (u && u.primaryEmailAddress && u.primaryEmailAddress.emailAddress)
    return u.primaryEmailAddress.emailAddress;
  if (u && u.username) return u.username;
  return isClerk() ? "" : "dashboard password";
}

function avatarUrl() {
  const u = cu();
  return (u && u.imageUrl) || "";
}

function initial() {
  return (dispName().trim().slice(0, 1) || "?").toUpperCase();
}

function signOut() {
  setUserMenuOpen(false);
  if (cu()) clerkSignOut();
  else logout();
}

export default function UserMenu() {
  let box = null;
  onMount(function () {
    const close = function (e) {
      if (box && !box.contains(e.target)) setUserMenuOpen(false);
    };
    const esc = function (e) {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    onCleanup(function () {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    });
  });
  return (
    <span class="relative" ref={(el) => (box = el)}>
      <Show
        when={avatarUrl()}
        fallback={
          <button
            class="w-7 h-7 rounded-full bg-neutral-900 text-white text-[11px] font-semibold flex items-center justify-center hover:ring-2 hover:ring-indigo-300 transition"
            title={dispName()}
            onClick={(e) => {
              e.stopPropagation();
              setUserMenuOpen(!userMenuOpen());
            }}
          >
            {initial()}
          </button>
        }
      >
        <img
          src={avatarUrl()}
          alt="avatar"
          class="w-7 h-7 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-indigo-300 transition object-cover"
          onClick={(e) => {
            e.stopPropagation();
            setUserMenuOpen(!userMenuOpen());
          }}
        />
      </Show>
      <div
        class="absolute right-0 top-9 z-50 w-80 bg-white rounded-xl border border-neutral-200 overflow-hidden animate-[fadeSlide_0.2s_ease]"
        style="box-shadow:0 20px 50px rgba(0,0,0,0.12)"
        classList={{ hidden: !userMenuOpen() }}
      >
        <div class="flex items-center gap-3.5 px-5 pt-5 pb-4">
          <Show
            when={avatarUrl()}
            fallback={
              <span class="w-12 h-12 rounded-full bg-neutral-900 text-white text-base font-semibold flex items-center justify-center flex-shrink-0">
                {initial()}
              </span>
            }
          >
            <img
              src={avatarUrl()}
              alt="avatar"
              class="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          </Show>
          <div class="flex flex-col min-w-0">
            <span class="text-[15px] font-semibold text-neutral-900 leading-tight truncate">
              {dispName()}
            </span>
            <Show when={dispSub()}>
              <span class="text-[13px] text-neutral-500 mt-0.5 truncate">{dispSub()}</span>
            </Show>
          </div>
        </div>
        <div class="flex gap-2.5 px-5 pb-4">
          <button
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition"
            onClick={() => {
              setUserMenuOpen(false);
              setProfileOpen(true);
            }}
          >
            <svg
              class="w-4 h-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Manage account
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium text-neutral-600 hover:bg-gray-50 hover:text-neutral-900 transition"
            onClick={signOut}
          >
            <svg
              class="w-4 h-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign out
          </button>
        </div>
        <div class="mx-5 h-px bg-neutral-100"></div>
        <div class="border-t border-neutral-100 px-5 py-3.5 flex items-center justify-center gap-1.5">
          <span class="text-xs text-neutral-400">Secured by</span>
          <span class="text-xs font-bold text-indigo-500 flex items-center gap-1">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            clerk
          </span>
        </div>
      </div>
    </span>
  );
}
