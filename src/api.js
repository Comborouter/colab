export const API =
  (import.meta.env && import.meta.env.VITE_API_URL) || "";

export async function api(p, o) {
  const headers = Object.assign({}, (o && o.headers) || {});
  try {
    if (window.Clerk && window.Clerk.session && !headers["authorization"]) {
      const t = await window.Clerk.session.getToken();
      if (t) headers["authorization"] = "Bearer " + t;
    }
  } catch (e) {}
  const r = await fetch(API + p, Object.assign({ credentials: "include" }, o, { headers: headers }));
  if (r.status === 401) {
    throw new Error("unauthorized");
  }
  const j = await r.json().catch(function () {
    return {};
  });
  if (!r.ok) throw new Error(j.error || j.detail || "HTTP " + r.status);
  return j;
}

export function busy(btn, label) {
  if (!btn) return;
  btn.dataset.o = btn.textContent;
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span>' + (label ? " " + label : "");
}

export function free(btn) {
  if (!btn) return;
  btn.disabled = false;
  if (btn.dataset.o != null) {
    btn.textContent = btn.dataset.o;
    delete btn.dataset.o;
  }
}

export function fmtDur(ms) {
  if (ms < 0) ms = 0;
  const t = Math.floor(ms / 1000);
  const h = Math.floor(t / 3600),
    m = Math.floor((t % 3600) / 60),
    s = t % 60;
  if (h > 0) return h + "h " + m + "m";
  if (m > 0) return m + "m " + s + "s";
  return s + "s";
}

export function shortEp(ep) {
  const p = String(ep).split("-");
  return p[p.length - 1].slice(0, 8);
}

export async function logout() {
  try {
    await fetch(API + "/logout", { credentials: "include" });
  } catch (e) {}
  location.href = "/";
}
