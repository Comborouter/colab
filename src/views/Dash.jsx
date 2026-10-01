import { For, Show, onMount, onCleanup } from "solid-js";
import { state, pickEp, dashTab, setDashTab, sessOpen, inviteModalOpen, setInviteModalOpen, setWorkspaceInvitations } from "../store.js";
import { bootFromCache, joinInvite, refresh, pollApps, openNS } from "../actions.js";
import Header from "../components/Header.jsx";
import OverviewTab from "../components/OverviewTab.jsx";
import AppsPanel from "../components/AppsPanel.jsx";
import SessionPanel from "../components/SessionPanel.jsx";
import LogsTab from "../components/LogsTab.jsx";
import ConfigureTab from "../components/ConfigureTab.jsx";
import NewSessModal from "../components/NewSessModal.jsx";
import MarketModal from "../components/MarketModal.jsx";
import ConfigureVmModal from "../components/ConfigureVmModal.jsx";
import ProfileModal from "../components/ProfileModal.jsx";
import ConnectProviderModal from "../components/ConnectProviderModal.jsx";
import InviteUserModal from "../components/InviteUserModal.jsx";
import PurinWelcome from "../components/PurinWelcome.jsx";
import BootOverlay from "../components/BootOverlay.jsx";

const TABS = [
  ["overview", "Overview"],
  ["apps", "Apps"],
  ["logs", "Logs"],
  ["configure", "Configure"],
];

const TITLES = {
  overview: "Overview",
  apps: "Apps",
  logs: "Logs",
  configure: "Configure",
};

export default function Dash() {
  onMount(function () {
    joinInvite();
    bootFromCache();
    refresh();
    setTimeout(pollApps, 1500);
    const iv1 = setInterval(function () {
      if (!document.hidden) refresh();
    }, 30000);
    const iv2 = setInterval(function () {
      if (!document.hidden && (state.apps || []).length && pickEp()) pollApps();
    }, 30000);
    const vis = function () {
      if (!document.hidden) {
        refresh();
        pollApps();
      }
    };
    document.addEventListener("visibilitychange", vis);
    onCleanup(function () {
      clearInterval(iv1);
      clearInterval(iv2);
      document.removeEventListener("visibilitychange", vis);
    });
  });
  return (
    <>
      <Header />
      <div class="border-b border-neutral-200">
        <nav class="max-w-5xl mx-auto px-4 flex items-center gap-7 text-sm">
          <For each={TABS}>
            {([id, label]) => (
              <button
                onClick={() => setDashTab(id)}
                class={
                  "h-11 flex items-center -mb-px transition " +
                  (dashTab() === id
                    ? "text-neutral-900 font-semibold border-b-2 border-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900")
                }
              >
                {label}
              </button>
            )}
          </For>
        </nav>
      </div>
      <main class="max-w-5xl mx-auto px-4 pb-6 space-y-3">
        <Show when={dashTab() === "overview"}>
          <div class="flex items-center justify-between">
            <h1 class="text-[28px] font-bold tracking-tight">
              {TITLES[dashTab()] || "Overview"}
            </h1>
            <button
              class="inline-flex items-center px-3.5 py-2 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium hover:bg-neutral-50 transition"
              onClick={() => openNS(null)}
            >
              New Session
            </button>
          </div>
        </Show>
        <Show when={dashTab() === "overview"}>
          <OverviewTab />
        </Show>
        <Show when={dashTab() === "apps"}>
          <AppsPanel />
        </Show>
        <Show when={dashTab() === "logs"}>
          <LogsTab />
        </Show>
        <Show when={sessOpen() && dashTab() !== "logs"}>
          <SessionPanel />
        </Show>
        <Show when={dashTab() === "configure"}>
          <ConfigureTab />
        </Show>
      </main>
      <NewSessModal />
      <MarketModal />
      <ConfigureVmModal />
      <ProfileModal />
      <ConnectProviderModal />
      <InviteUserModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInviteCreated={(inv) => setWorkspaceInvitations((prev) => [inv, ...prev])}
      />
      <PurinWelcome />
      <BootOverlay />
    </>
  );
}
