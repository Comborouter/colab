import { For, Show, createEffect } from "solid-js";
import {
  launchApp,
  launchVars,
  setLaunchVars,
  launchMsg,
  aliveSessions,
  pickEp,
  state,
  appStates,
} from "../store.js";
import { closeLaunch, launchSubmit, openNS } from "../actions.js";
import { api, shortEp } from "../api.js";
import SessPills from "./SessPills.jsx";

function vmLabel(ep) {
  const r = (state.sessions || []).find(function (x) {
    return x.endpoint === ep;
  });
  return (r && r.name) || shortEp(ep);
}

function varDefs() {
  const la = launchApp();
  const v = la && Array.isArray(la.mf.vars) ? la.mf.vars : [];
  return v.filter(function (d) {
    return d && typeof d.name === "string" && /^[A-Za-z_][A-Za-z0-9_]{0,31}$/.test(d.name);
  });
}

function runningState() {
  const la = launchApp();
  const ep = pickEp();
  if (!la || !ep) return null;
  const m = appStates[ep];
  const s = m && m[la.name];
  return s && s.running ? s : null;
}

export default function LaunchDialog() {
  createEffect(function () {
    const la = launchApp();
    const ep = pickEp();
    if (!la || !ep) return;
    api(
      "/api/apps/vars?name=" +
        encodeURIComponent(la.name) +
        "&endpoint=" +
        encodeURIComponent(ep)
    )
      .then(function (r) {
        if (!launchApp() || pickEp() !== ep) return;
        if (r && r.vars && typeof r.vars === "object") {
          const base = {};
          varDefs().forEach(function (d) {
            base[d.name] = d.default != null ? String(d.default) : "";
          });
          const merged = base;
          Object.keys(r.vars).forEach(function (k) {
            merged[k] = r.vars[k];
          });
          setLaunchVars(merged);
        }
      })
      .catch(function () {});
  });
  return (
    <Show when={launchApp()}>
      <div class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/30" onClick={closeLaunch}></div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,94vw)] max-h-[88vh] overflow-y-auto bg-white border border-neutral-300 rounded-xl shadow-xl">
          <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <span class="text-sm font-semibold">
              {launchApp().isExt ? "add" : "launch"}{" "}
              {launchApp().mf.title || launchApp().name}
            </span>
            <button class="btn btn-xs" onClick={closeLaunch}>
              close
            </button>
          </div>
          <div class="p-4 space-y-3">
            <Show when={runningState()}>
              <div class="flex items-center gap-2 text-xs border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50 flex-wrap">
                <span class="mono text-[10px] text-green-600">
                  running on {vmLabel(pickEp())}
                </span>
                <span class="flex-1"></span>
                <Show when={runningState().url}>
                  <a
                    class="btn btn-xs btn-p"
                    href={runningState().url}
                    target="_blank"
                    rel="noopener"
                  >
                    open ↗
                  </a>
                </Show>
              </div>
            </Show>
            <div>
              <div class="ph mb-1.5">virtual machine</div>
              <Show
                when={aliveSessions().length}
                fallback={
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="hint">no virtual machines</span>
                    <button class="btn btn-xs btn-p" onClick={() => openNS(null)}>
                      create a VM
                    </button>
                  </div>
                }
              >
                <div class="flex items-center gap-1.5 flex-wrap">
                  <SessPills />
                </div>
              </Show>
            </div>
            <Show when={varDefs().length}>
              <div>
                <div class="ph mb-1.5">variables</div>
                <div class="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 items-center text-xs">
                  <For each={varDefs()}>
                    {(d) => (
                      <>
                        <span class="hint text-right">
                          {d.required ? "* " : ""}
                          {d.label || d.name}
                        </span>
                        <input
                          type={d.secret ? "password" : "text"}
                          class="inp w-full"
                          placeholder={
                            d.default != null && d.default !== ""
                              ? String(d.default)
                              : "optional"
                          }
                          value={(launchVars() || {})[d.name] || ""}
                          onInput={(e) =>
                            setLaunchVars(
                              Object.assign({}, launchVars(), {
                                [d.name]: e.currentTarget.value,
                              })
                            )
                          }
                        />
                      </>
                    )}
                  </For>
                </div>
                <p class="hint mt-1">values are saved per virtual machine</p>
              </div>
            </Show>
            <Show when={launchMsg()}>
              <p class="mono text-[11px] text-neutral-600">{launchMsg()}</p>
            </Show>
            <div class="flex gap-2">
              <button class="btn btn-p" onClick={(e) => launchSubmit(e.currentTarget)}>
                {launchApp().isExt ? "install" : "install & launch"}
              </button>
              <button class="btn" onClick={closeLaunch}>
                cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
