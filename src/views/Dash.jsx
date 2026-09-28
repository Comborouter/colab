import { onMount, onCleanup } from "solid-js";
import { state, pickEp, actMsg } from "../store.js";
import { bootFromCache, joinInvite, refresh, pollApps } from "../actions.js";
import Header from "../components/Header.jsx";
import VmsGrid from "../components/VmsGrid.jsx";
import SessionPanel from "../components/SessionPanel.jsx";
import AppsPanel from "../components/AppsPanel.jsx";
import AccountsPanel from "../components/AccountsPanel.jsx";
import NewSessModal from "../components/NewSessModal.jsx";
import MarketModal from "../components/MarketModal.jsx";
import BootOverlay from "../components/BootOverlay.jsx";

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
      <p class="max-w-5xl mx-auto px-4 mono text-[11px] text-neutral-600 pt-2 min-h-[14px]">
        {actMsg()}
      </p>
      <main class="max-w-5xl mx-auto px-4 pb-6 space-y-3">
        <VmsGrid />
        <SessionPanel />
        <AppsPanel />
        <AccountsPanel />
      </main>
      <NewSessModal />
      <MarketModal />
      <BootOverlay />
    </>
  );
}
