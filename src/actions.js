import { api, busy, free, shortEp } from "./api.js";
import { reconcile } from "solid-js/store";
import { purinNotify } from "./toast.jsx";
import {
  state,
  setState,
  setAppStates,
  appStates,
  setMarketItems,
  setMcat,
  setMkOpen,
  setMkAdd,
  setBootMsg,
  setViewTab,
  setViewEp,
  setSelEp,
  setEvCursor,
  setNsOpen,
  setNsPending,
  setNsProfile,
  nsAppend,
  nsResetLog,
  setSessOpen,
  setCodeOpen,
  setConnectModalOpen,
  setConnectModalProvider,
  connectModalOpen,
  connectModalProvider,
  configSubTab,
  setConfigSubTab,
  setRoute,
  setDashTab,
  setWsPopOpen,
  setOpenMenu,
  setRefreshTick,
  setLaunchApp,
  setLaunchVars,
  setLaunchMsg,
  launchApp,
  launchVars,
  sessOpen,
  nsPending,
  evCursor,
  pickEp,
  aliveSessions,
  bootMsg,
  lsGet,
  lsSet,
  refs,
} from "./store.js";

const JSON_HEADERS = { "content-type": "application/json" };

export function msg(t) {
  purinNotify(t);
}

export function mkMsg(t) {
  purinNotify(t);
}

export function pickEpStore(ep) {
  setSelEp(ep);
  lsSet("selVm", ep);
}

export function toggleSessPanel(force) {
  const show = force !== undefined ? force : !sessOpen();
  setSessOpen(show);
}

export function mergeEvents(nw, old) {
  if (!nw || !nw.length) return old || [];
  if (!old || !old.length) return nw;
  const out = nw.slice();
  const seen = {};
  for (const e of out) if (e.id) seen[e.id] = 1;
  for (const e of old) {
    if (e.id && seen[e.id]) continue;
    out.push(e);
    if (out.length >= 150) break;
  }
  return out;
}

export function bootFromCache() {
  let cached = null;
  try {
    cached = JSON.parse(lsGet("lsState") || "null");
  } catch (e) {}
  if (cached && cached.s && Array.isArray(cached.s.sessions)) {
    setState(reconcile(cached.s));
    // the cached workspace id is stale right after a switch — blank it so
    // URL routing only ever compares against a fresh network id
    setState("ws", "id", "");
    setBootMsg(null);
  } else {
    setEvCursor(0);
  }
}

export async function refresh() {
  try {
    const prevEvents = state.events || [];
    const cursor = evCursor();
    const n = await api("/api/state" + (cursor ? "?ev=" + cursor : ""));
    let evs = n.events || [];
    if (cursor && prevEvents.length) evs = mergeEvents(evs, prevEvents);
    n.events = evs;
    setState(reconcile(n));
    setRefreshTick(function (t) {
      return t + 1;
    });
    let maxEv = 0;
    for (const e of evs) if (e.id && e.id > maxEv) maxEv = e.id;
    if (maxEv > cursor) {
      setEvCursor(maxEv);
      lsSet("evCursor", String(maxEv));
    }
    lsSet("lsState", JSON.stringify({ t: Date.now(), s: n }));
    setWsPopOpen(false);
    setBootMsg(null);
  } catch (e) {
    if (bootMsg() !== null) setBootMsg(String(e));
  }
}

export async function pollApps() {
  const ep = pickEp();
  if (ep) {
    try {
      const r = await api("/api/apps/action", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ action: "status", endpoint: ep }),
      });
      if (r.ok && r.all) setAppStates(ep, reconcile(r.all));
    } catch (e) {}
  }
}

export function openConnectModal(provider = "colab") {
  setConnectModalProvider(provider);
  setConnectModalOpen(true);
}

export function closeConnectModal() {
  setConnectModalOpen(false);
}

export function openWorkspaceSettings() {
  setWsPopOpen(false);
  setRoute("dash");
  setDashTab("configure");
  setConfigSubTab("settings");
}

export function openWorkspaceTeam() {
  setWsPopOpen(false);
  setRoute("dash");
  setDashTab("configure");
  setConfigSubTab("team");
}

export async function startConnect() {
  try {
    const r = await api("/api/connect-url");
    window.open(r.url, "_blank");
    setCodeOpen(true);
    setTimeout(function () {
      if (refs.codeInput) refs.codeInput.focus();
    }, 0);
  } catch (e) {
    msg("error: " + e);
  }
}

export async function submitCode(btn, inputEl) {
  const input = inputEl || refs.codeInput;
  const code = input ? input.value.trim() : "";
  if (!code) return;
  busy(btn, "…");
  try {
    await api("/api/connect-submit", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ code: code }),
    });
    input.value = "";
    setCodeOpen(false);
    msg("colab account connected");
    refresh();
  } catch (e) {
    msg("error: " + e);
  } finally {
    free(btn);
  }
}

export async function removeProfile(email) {
  if (!confirm("Remove " + email + "? Its sessions stop being keep-alive'd.")) return;
  try {
    await api("/api/profiles/remove", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ email: email }),
    });
    refresh();
  } catch (e) {
    msg("error: " + e);
  }
}

export function openNS(pending) {
  setNsPending(pending || null);
  nsResetLog();
  nsAppend("session account: pick in the modal");
  if (pending) nsAppend("after creation: " + pending.action + " " + pending.name);
  setNsOpen(true);
  setTimeout(function () {
    if (refs.nsName) refs.nsName.focus();
  }, 0);
}

export function closeNS() {
  setNsOpen(false);
  setNsPending(null);
}

export async function nsCreate(btn) {
  const nm = refs.nsName ? refs.nsName.value.trim() : "";
  const ac = refs.nsAccel ? refs.nsAccel.value : "NONE";
  const hm = refs.nsHm ? refs.nsHm.checked : false;
  const prof = refs.nsProfile ? refs.nsProfile.value : "";
  const prov = refs.nsProvider ? refs.nsProvider.value : "colab";
  if (prof) {
    setNsProfile(prof);
    lsSet("nsProfile", prof);
  }
  busy(btn, "assigning");
  nsAppend(
    "\u2192 request " + ac + (hm ? " \u00b7 high-mem" : "") + (nm ? " \u00b7 " + nm : "") + (prof ? " \u00b7 " + prof : "")
  );
  try {
    const r = await api("/api/new", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: nm, accelerator: ac, high_mem: hm, profile: prof, provider: prov }),
    });
    if (r.ok) {
      nsAppend("\u2713 " + r.name + " \u2192 " + r.endpoint);
      nsAppend("keep-alive starts on the next cron tick (\u22642m)");
      pickEpStore(r.endpoint);
      if (refs.nsName) refs.nsName.value = "";
      await refresh();
      const p = nsPending();
      closeNS();
      msg("session " + r.name + " ready");
      if (p) setTimeout(function () { runOnMachines(p.action, p.name, null); }, 400);
    } else {
      nsAppend("\u2717 " + (r.error || "failed"));
    }
  } catch (e) {
    nsAppend("\u2717 " + e);
    if (String(e).indexOf("unauthorized") >= 0) nsAppend("\u2192 connect colab in the accounts panel first");
  } finally {
    free(btn);
  }
}

export async function stopSess(ep) {
  if (!confirm("Stop session " + ep + "?")) return;
  try {
    await api("/api/stop", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ endpoint: ep }),
    });
    msg("stopping " + shortEp(ep));
  } catch (e) {
    msg("error: " + e);
  }
  refresh();
}

export function renameSess(ep, cur) {
  const name = prompt("name for " + ep, cur || "");
  if (name === null) return;
  api("/api/rename", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ endpoint: ep, name: name.trim() }),
  })
    .then(refresh)
    .catch(function (e) {
      msg("error: " + e);
    });
}

export async function runOnMachines(action, name, btn) {
  const ep = pickEp();
  if (!ep) {
    msg("no machine \u2014 provision one first");
    openNS({ action: action, name: name });
    return;
  }
  busy(btn, "\u2026");
  msg(action + " " + name + " @ " + shortEp(ep) + "\u2026");
  try {
    await api("/api/apps/action", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ action: action, name: name, endpoint: ep }),
    });
    msg(action + " " + name + " ok");
  } catch (e) {
    msg(action + " " + name + ": " + e);
  }
  free(btn);
  refresh();
  setTimeout(pollApps, 4000);
  setTimeout(pollApps, 12000);
  setTimeout(pollApps, 25000);
}

export async function appDelete(name, btn) {
  if (!confirm("Remove app " + name + " from the registry?")) return;
  busy(btn, "\u2026");
  try {
    await api("/api/apps/delete", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: name }),
    });
    msg("deleted " + name);
    await refresh();
  } catch (e) {
    msg("error: " + e);
  } finally {
    free(btn);
  }
}

export function vmPick(ep) {
  pickEpStore(ep);
  pollApps();
}

export function showTab(tab) {
  setViewTab(tab);
  lsSet("viewTab", tab);
  toggleSessPanel(true);
  setWsPopOpen(false);
}

export function viewLog(ep) {
  setViewEp(ep);
  setViewTab("log");
  toggleSessPanel(true);
  setWsPopOpen(false);
  setTimeout(function () {
    if (refs.events) refs.events.scrollTop = 0;
  }, 0);
}

export async function mkLoadMarket() {
  try {
    setMarketItems((await api("/api/market")).items || []);
  } catch (e) {
    setMarketItems([]);
  }
}

export async function openMarket() {
  setMkOpen(true);
  mkMsg("loading\u2026");
  await mkLoadMarket();
  pollApps();
}

export function closeMarket() {
  setMkOpen(false);
}

export function mkShowAdd(on) {
  setMkAdd(on);
}

export async function mkUpload() {
  const f = refs.mkFile && refs.mkFile.files[0];
  if (!f) return;
  mkMsg("uploading " + f.name + "\u2026");
  const fd = new FormData();
  fd.append("file", f);
  try {
    const r = await api("/api/apps/upload", { method: "POST", body: fd });
    mkMsg("uploaded " + r.name);
    refs.mkFile.value = "";
    await refresh();
    pollApps();
  } catch (e) {
    mkMsg("error: " + e);
  }
}

export async function mkSubmit(btn) {
  const body = {
    name: refs.mkName.value.trim(),
    title: refs.mkTitle.value.trim(),
    category: refs.mkCat.value,
    url: refs.mkUrl.value.trim(),
    description: refs.mkDesc.value.trim(),
  };
  busy(btn);
  try {
    await api("/api/market", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) });
    mkMsg("submitted " + body.name);
    mkShowAdd(false);
    await mkLoadMarket();
  } catch (e) {
    mkMsg("error: " + e);
  } finally {
    free(btn);
  }
}

export async function mkRemove(name) {
  if (!confirm("Remove community entry " + name + "?")) return;
  try {
    await api("/api/market", {
      method: "DELETE",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: name }),
    });
    await mkLoadMarket();
    mkMsg("removed " + name);
  } catch (e) {
    mkMsg("error: " + e);
  }
}

export async function mkCopy(btn) {
  try {
    await navigator.clipboard.writeText(refs.mkPrompt.value);
    mkMsg("prompt copied");
    busy(btn, "copied");
    setTimeout(function () {
      free(btn);
    }, 1200);
  } catch (e) {
    mkMsg("copy failed \u2014 select the text manually");
  }
}

export function mkCheck() {
  mkMsg("checking\u2026");
  pollApps().then(function () {
    mkMsg("state refreshed");
  });
}

export function mkSetCat(cat) {
  setMcat(cat);
  mkShowAdd(false);
}

export function openLaunch(name) {
  const a = (state.apps || []).find(function (x) {
    return x.name === name;
  });
  if (!a) {
    mkMsg("app not found in registry");
    return;
  }
  const mf = a.meta || {};
  setLaunchApp({ name: name, mf: mf, isExt: mf.type === "extension" });
  const v = {};
  (Array.isArray(mf.vars) ? mf.vars : []).forEach(function (d) {
    if (d && d.name) v[d.name] = d.default != null ? String(d.default) : "";
  });
  setLaunchVars(v);
  setLaunchMsg("");
}

export function closeLaunch() {
  setLaunchApp(null);
}

function sleepMs(ms) {
  return new Promise(function (r) {
    setTimeout(r, ms);
  });
}

export async function installSubmit(btn) {
  const la = launchApp();
  if (!la) return;
  const ep = pickEp();
  if (!ep) {
    setLaunchMsg("pick or create a virtual machine first");
    return;
  }
  const defs = Array.isArray(la.mf.vars) ? la.mf.vars : [];
  const vals = launchVars() || {};
  for (let i = 0; i < defs.length; i++) {
    const d = defs[i] || {};
    const v = String(vals[d.name] != null ? vals[d.name] : "");
    if (d.required && !v.trim()) {
      setLaunchMsg("required: " + (d.label || d.name));
      return;
    }
    if (d.validate === "url" && v.trim()) {
      let u = null;
      try {
        u = new URL(v.trim());
      } catch {}
      if (!u || (u.protocol !== "http:" && u.protocol !== "https:")) {
        setLaunchMsg(
          "invalid " + (d.label || d.name) + " — must start with http:// or https://"
        );
        return;
      }
    }
  }
  busy(btn, "working");
  try {
    const r = await api("/api/apps/action", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ action: "install", name: la.name, endpoint: ep, vars: vals }),
    });
    if (r && r.ok === false) {
      setLaunchMsg(r.error || "install failed");
      return;
    }
    closeLaunch();
    msg("installing " + la.name + " @ " + shortEp(ep) + "…");
    pollApps();
    setTimeout(pollApps, 1500);
    setTimeout(pollApps, 5000);
    setTimeout(pollApps, 12000);
    setTimeout(pollApps, 25000);
    setTimeout(pollApps, 60000);
    setTimeout(pollApps, 120000);
    refresh();
  } catch (e) {
    setLaunchMsg("error: " + e);
  } finally {
    free(btn);
  }
}

export async function marketLaunch(name, btn) {
  const ep = pickEp();
  if (!ep) {
    msg("no machine — provision one first");
    openNS({ action: "launch", name: name });
    return;
  }
  const cur = () => {
    const m = appStates[ep];
    return (m && m[name]) || null;
  };
  const s0 = cur();
  if (s0 && s0.running && s0.url) {
    window.open(s0.url, "_blank", "noopener");
    return;
  }
  const w = window.open("about:blank", "_blank");
  busy(btn, "…");
  msg("launching " + name + " @ " + shortEp(ep) + "…");
  try {
    await api("/api/apps/action", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ action: "launch", name: name, endpoint: ep }),
    });
    for (let i = 0; i < 30; i++) {
      await sleepMs(2000);
      await pollApps();
      const s = cur();
      if (s && s.running && s.url) {
        if (w && !w.closed) w.location.href = s.url;
        else window.open(s.url, "_blank", "noopener");
        msg(name + " running — opened");
        return;
      }
      if (s && s.failed && !s.running) break;
    }
    if (w && !w.closed) w.close();
    msg(name + ": no tunnel yet — app is running on the vm, check back shortly");
  } catch (e) {
    if (w && !w.closed) w.close();
    msg(name + " launch: " + e);
  } finally {
    free(btn);
    refresh();
    setTimeout(pollApps, 8000);
  }
}

export function marketRemove(name, btn) {
  const ep = pickEp();
  if (!ep) {
    msg("no machine — provision one first");
    return;
  }
  if (!confirm("Remove " + name + " from " + shortEp(ep) + "?")) return;
  runOnMachines("remove", name, btn);
}

export function appMore(name) {
  setOpenMenu(openMenu() === name ? "" : name);
}

export async function wsShare() {
  try {
    const r = await api("/api/ws/invite", { method: "POST", headers: JSON_HEADERS, body: "{}" });
    if (!r.ok) {
      msg(r.error || "invite failed");
      return;
    }
    if (navigator.clipboard) navigator.clipboard.writeText(r.url).catch(function () {});
    msg("invite link copied (7 days): " + r.url);
  } catch (e) {
    msg("invite failed: " + String(e).slice(0, 120));
  }
}

export async function wsCreate(name, logo, slug) {
  const nm = String(name || "").trim().slice(0, 40);
  if (!nm) {
    msg("name the workspace first");
    return;
  }
  const sl = String(slug || "")
    .trim()
    .toLowerCase()
    .slice(0, 40);
  if (!/^[a-z0-9-]{1,40}$/.test(sl)) {
    msg("slug: lowercase letters, numbers, dashes");
    return;
  }
  try {
    const r = await api("/api/ws/create", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name: nm, logo: logo || "", slug: sl }),
    });
    if (!r.ok) {
      msg(r.error || "create failed");
      return;
    }
    location.reload();
  } catch (e) {
    msg("create failed: " + String(e).slice(0, 120));
  }
}

export async function wsRename() {
  const input = refs.wsRename;
  const nm = input ? input.value.trim().slice(0, 40) : "";
  const wsid = (state.ws && state.ws.id) || "";
  if (!wsid || !nm) {
    msg("name the workspace first");
    return;
  }
  try {
    const r = await api("/api/ws/rename", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ wsid: wsid, name: nm }),
    });
    if (!r.ok) {
      msg(r.error || "rename failed");
      return;
    }
    msg("workspace renamed");
    refresh();
  } catch (e) {
    msg("rename failed: " + String(e).slice(0, 120));
  }
}

export async function wsSaveLogo(dataUrl) {
  const wsid = (state.ws && state.ws.id) || "";
  if (!wsid) {
    msg("no workspace selected");
    return;
  }
  try {
    const r = await api("/api/ws/logo", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ wsid: wsid, logo: dataUrl }),
    });
    if (!r.ok) {
      msg(r.error || "logo upload failed");
      return;
    }
    msg("logo updated");
    refresh();
  } catch (e) {
    msg("logo upload failed: " + String(e).slice(0, 120));
  }
}

export function wsSwitch(wsid) {
  api("/api/ws/switch", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ wsid: wsid }),
  })
    .then(function () {
      try {
        sessionStorage.setItem("wsSwitchTried:" + wsid, "1");
        const parts = location.pathname.split("/").filter(Boolean);
        parts[0] = wsid;
        history.replaceState(null, "", "/" + parts.join("/") + location.search);
      } catch (e) {}
      location.reload();
    })
    .catch(function () {
      msg("switch failed");
    });
}

export function joinInvite() {
  const m = /[?&]invite=([A-Za-z0-9]+)/.exec(location.search);
  if (!m) return Promise.resolve();
  return api("/api/ws/join", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ code: m[1] }),
  })
    .then(function (r) {
      msg(r && r.ok ? "joined workspace" : (r && r.error) || "join failed");
      try {
        const parts = location.pathname.split("/").filter(Boolean);
        if (r && r.ok && r.wsid) parts[0] = r.wsid;
        history.replaceState(null, "", "/" + parts.join("/"));
      } catch (e) {}
      if (r && r.ok)
        setTimeout(function () {
          location.reload();
        }, 800);
    })
    .catch(function () {
      msg("join failed");
    });
}
