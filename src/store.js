import { createSignal, createMemo } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

function readBoot() {
  const injected = window.__BOOT__ || {};
  if (injected.pk) return injected;
  const env = (import.meta.env) || {};
  return {
    authed: false,
    pk: env.VITE_CLERK_PK || "",
    host: env.VITE_CLERK_HOST || "",
    pw: env.VITE_DEV_PW === "1",
  };
}
export const boot = readBoot();

export function lsGet(k) {
  try {
    return localStorage.getItem(k) || "";
  } catch (e) {
    return "";
  }
}

export function lsSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch (e) {}
}

export const [state, setState] = createStore({
  sessions: [],
  events: [],
  apps: [],
  profiles: [],
  auth: {},
  ws: {},
  user: null,
});

export const [appStates, setAppStates] = createStore({});
export const [marketItems, setMarketItems] = createSignal([]);
export const [mcat, setMcat] = createSignal("all");
export const [mkOpen, setMkOpen] = createSignal(false);
export const [mkAdd, setMkAdd] = createSignal(false);
export const [tourOpen, setTourOpen] = createSignal(false);
export const [bootMsg, setBootMsg] = createSignal("loading state\u2026");
export const [viewTab, setViewTab] = createSignal(lsGet("viewTab") || "log");
export const [viewEp, setViewEp] = createSignal("");
export const [selEp, setSelEp] = createSignal(lsGet("selVm") || "");
export const [evCursor, setEvCursor] = createSignal(
  parseInt(lsGet("evCursor") || "0", 10) || 0
);
export const [nsOpen, setNsOpen] = createSignal(false);
export const [nsPending, setNsPending] = createSignal(null);
export const [nsProfile, setNsProfile] = createSignal(lsGet("nsProfile") || "");
export const [nsLogText, setNsLogText] = createSignal("(console)");
export const [sessOpen, setSessOpenRaw] = createSignal(lsGet("sessOpen") === "1");
export const [codeOpen, setCodeOpen] = createSignal(false);
export const [connectModalOpen, setConnectModalOpen] = createSignal(false);
export const [connectModalProvider, setConnectModalProvider] = createSignal("colab");

const TABS = ["overview", "apps", "logs", "configure"];
const SUBS = ["settings", "team", "providers"];
const pathFromUrl = (function () {
  const parts = location.pathname.split("/").filter(Boolean);
  const out = { ws: "", tab: "", sub: "" };
  if (parts[0]) out.ws = parts[0];
  if (TABS.indexOf(parts[1]) >= 0) out.tab = parts[1];
  if (SUBS.indexOf(parts[2]) >= 0) out.sub = parts[2];
  return out;
})();
let urlPrimed = false;

export function consumePathWs() {
  const w = pathFromUrl.ws;
  pathFromUrl.ws = "";
  return w;
}

export function syncUrl(push) {
  try {
    const id = state.ws && state.ws.id;
    if (!id) return;
    let p = "/" + id + "/" + dashTab();
    if (dashTab() === "configure") p += "/" + configSubTab();
    const target = p + location.search;
    if (location.pathname + location.search === target) return;
    const usePush = push === true || (push !== false && urlPrimed);
    if (usePush) history.pushState(null, "", target);
    else history.replaceState(null, "", target);
    urlPrimed = true;
  } catch (e) {}
}

window.addEventListener("popstate", function () {
  try {
    const parts = location.pathname.split("/").filter(Boolean);
    const tab = TABS.indexOf(parts[1]) >= 0 ? parts[1] : "overview";
    setDashTabRaw(tab);
    if (tab === "configure" && SUBS.indexOf(parts[2]) >= 0) {
      setConfigSubTabRaw(parts[2]);
    }
  } catch (e) {}
});

const [configSubTabRaw, setConfigSubTabRaw] = createSignal(pathFromUrl.sub || "settings");
export const configSubTab = configSubTabRaw;
export function setConfigSubTab(v) {
  setConfigSubTabRaw(v);
  syncUrl();
}
export const [wsPopOpen, setWsPopOpen] = createSignal(false);
export const [openMenu, setOpenMenu] = createSignal("");
export const [refreshTick, setRefreshTick] = createSignal(0);
export const [route, setRoute] = createSignal("dash");
const initialClaimed = lsGet("claimed") === "1" || !!lsGet("wsEmail");
export const [claimed, setClaimedRaw] = createSignal(initialClaimed);
export function setClaimed(v) {
  setClaimedRaw(!!v);
  lsSet("claimed", v ? "1" : "0");
}
export const [createWsOpen, setCreateWsOpen] = createSignal(false);
export const [profileOpen, setProfileOpen] = createSignal(false);
export const [userMenuOpen, setUserMenuOpen] = createSignal(false);
export const [inviteModalOpen, setInviteModalOpen] = createSignal(false);
export const [workspaceInvitations, setWorkspaceInvitations] = createSignal([]);
export const [dashTab, setDashTabRaw] = createSignal(
  pathFromUrl.tab || lsGet("dashTab") || "overview"
);
export const [vmModal, setVmModal] = createSignal("");
export const [launchApp, setLaunchApp] = createSignal(null);
export const [launchVars, setLaunchVars] = createSignal({});
export const [launchMsg, setLaunchMsg] = createSignal("");

export function setSessOpen(v) {
  setSessOpenRaw(v);
  lsSet("sessOpen", v ? "1" : "0");
}

export function setDashTab(v) {
  setDashTabRaw(v);
  lsSet("dashTab", v);
  syncUrl();
}

export function nsAppend(t) {
  setNsLogText(function (prev) {
    const base = prev === "(console)" ? "" : prev;
    return (base ? base + "\n" : "") + new Date().toTimeString().slice(0, 8) + "  " + t;
  });
}

export function nsResetLog() {
  setNsLogText("(console)");
}

export const aliveSessions = createMemo(function () {
  return (state.sessions || []).filter(function (r) {
    return !r.dead_at;
  });
});

export const deadCount = createMemo(function () {
  return (state.sessions || []).length - aliveSessions().length;
});

export const isAdmin = createMemo(function () {
  return !!(state.user && state.user.admin);
});

export const isClerk = createMemo(function () {
  return !!(state.user && state.user.kind === "clerk");
});

export const pickEp = createMemo(function () {
  const alive = aliveSessions();
  if (!alive.length) return "";
  if (selEp() && alive.some(function (r) { return r.endpoint === selEp(); })) {
    return selEp();
  }
  return alive[0].endpoint;
});

export const effViewEp = createMemo(function () {
  const alive = aliveSessions();
  const v = viewEp();
  if (v && alive.some(function (r) { return r.endpoint === v; })) return v;
  return alive.length ? alive[0].endpoint : "";
});

export const refs = {};

if (import.meta.env.DEV) {
  window.__store = {
    state,
    setState,
    appStates,
    setAppStates,
    bootMsg,
    tourOpen,
    setTourOpen,
    connectModalOpen,
    setConnectModalOpen,
    launchApp,
    nsOpen,
    dashTab,
    setDashTab,
    configSubTab,
    setConfigSubTab,
    mkOpen,
    setMkOpen,
    mkAdd,
    setMkAdd,
    setMcat,
    lsGet,
    lsSet,
  };
}
