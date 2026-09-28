import { For, Show, createMemo } from "solid-js";
import { mkOpen, mkAdd, mkMsgText, mcat, marketItems, state, refs } from "../store.js";
import {
  closeMarket,
  mkCheck,
  mkUpload,
  mkShowAdd,
  mkSubmit,
  mkRemove,
  mkCopy,
  mkSetCat,
  mkMsg,
  runOnMachines,
  appDelete,
} from "../actions.js";
import SessPills from "./SessPills.jsx";
import StateCell from "./StateCell.jsx";
import { PROMPT } from "../promptText.js";

const CATS = ["all", "apps", "extensions", "community"];

export default function MarketModal() {
  const all = createMemo(function () {
    const up = (state.apps || []).map(function (a) {
      const mf = a.meta || {};
      return {
        kind: "upload",
        name: a.name,
        title: mf.title || a.name,
        mf: mf,
        size: a.size,
        uploaded: a.uploaded,
        cat: mf.type === "extension" ? "extensions" : "apps",
      };
    });
    const co = marketItems().map(function (m) {
      return {
        kind: "community",
        name: m.name,
        title: m.title || m.name,
        cat: "community",
        url: m.url,
        description: m.description || "",
        category: m.category || "apps",
        added: m.added,
      };
    });
    return up.concat(co);
  });
  const counts = createMemo(function () {
    const c = { all: all().length, apps: 0, extensions: 0, community: 0 };
    all().forEach(function (x) {
      c[x.cat] = (c[x.cat] || 0) + 1;
    });
    return c;
  });
  const items = createMemo(function () {
    return all().filter(function (x) {
      return mcat() === "all" || x.cat === mcat();
    });
  });

  const uploadCard = (it) => {
    const mf = it.mf;
    const isExt = it.cat === "extensions";
    const metaBits = [
      mf.version || "v?",
      isExt ? "\u2192 " + (mf.target || "?") : ":" + (mf.port || "?"),
      Math.round((it.size || 0) / 1024) + " KB",
    ];
    const life = [];
    if (mf.author) life.push(mf.author);
    if (mf.created_at) life.push("created " + String(mf.created_at).slice(0, 10));
    if (mf.updated_at && mf.updated_at !== mf.created_at)
      life.push("updated " + String(mf.updated_at).slice(0, 10));
    life.push((mf.downloads || 0) + " install" + ((mf.downloads || 0) === 1 ? "" : "s"));
    const shots = (Array.isArray(mf.screenshots) ? mf.screenshots : []).filter(function (u) {
      return typeof u === "string" && u;
    });
    return (
      <div class="card">
        <Show when={typeof mf.image === "string" && mf.image}>
          <img
            src={mf.image}
            alt=""
            class="w-full h-20 object-cover rounded border border-neutral-100"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </Show>
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="text-[13px] font-medium leading-tight">{it.title}</div>
            <div class="mono text-[10px] text-neutral-500">{it.name}</div>
          </div>
          <span class="text-[9px] font-semibold uppercase border border-neutral-300 text-neutral-500 rounded-full px-1.5 py-0.5">
            {it.cat.replace(/s$/, "")}
          </span>
        </div>
        <div class="mono text-[10px] text-neutral-500">{metaBits.join(" \u00b7 ")}</div>
        <Show when={mf.description}>
          <p class="text-[11px] text-neutral-600 leading-snug">{mf.description}</p>
        </Show>
        <Show when={shots.length}>
          <div class="flex gap-1 overflow-x-auto">
            <For each={shots.slice(0, 6)}>
              {(u) => (
                <img
                  src={u}
                  alt=""
                  class="h-10 rounded border border-neutral-100 shrink-0"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
            </For>
          </div>
        </Show>
        <div class="mono text-[9px] text-neutral-400">{life.join(" \u00b7 ")}</div>
        <div>
          <StateCell name={it.name} />
        </div>
        <div class="flex gap-1.5 flex-wrap mt-auto">
          <button
            class="btn btn-xs"
            onClick={(e) => {
              mkMsg("install " + it.name + "\u2026");
              runOnMachines("install", it.name, e.currentTarget);
            }}
          >
            {isExt ? "add" : "install"}
          </button>
          <Show when={!isExt}>
            <button
              class="btn btn-xs"
              onClick={(e) => {
                mkMsg("launch " + it.name + "\u2026");
                runOnMachines("launch", it.name, e.currentTarget);
              }}
            >
              launch
            </button>
            <button
              class="btn btn-xs"
              onClick={(e) => {
                mkMsg("stop " + it.name + "\u2026");
                runOnMachines("stop", it.name, e.currentTarget);
              }}
            >
              stop
            </button>
          </Show>
          <button
            class="btn btn-xs"
            title="remove from registry"
            onClick={(e) => {
              mkMsg("removing " + it.name + "\u2026");
              appDelete(it.name, e.currentTarget);
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  const communityCard = (it) => (
    <div class="card">
      <div class="flex items-start justify-between gap-2">
        <div>
          <div class="text-[13px] font-medium leading-tight">{it.title}</div>
          <div class="mono text-[10px] text-neutral-500">{it.name}</div>
        </div>
        <span class="text-[9px] font-semibold uppercase border border-neutral-300 text-neutral-500 rounded-full px-1.5 py-0.5">
          {it.category}
        </span>
      </div>
      <p class="text-[11px] text-neutral-600 leading-snug">{it.description}</p>
      <div class="flex gap-1.5 flex-wrap mt-auto">
        <Show when={it.url}>
          <a class="btn btn-xs" href={it.url} target="_blank" rel="noopener">
            repo
          </a>
        </Show>
        <button class="btn btn-xs" onClick={() => mkRemove(it.name)}>
          ×
        </button>
      </div>
    </div>
  );

  return (
    <Show when={mkOpen()}>
      <div class="fixed inset-0 z-40">
        <div class="absolute inset-0 bg-black/30" onClick={closeMarket}></div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(1080px,94vw)] h-[min(640px,92vh)] bg-white border border-neutral-300 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div class="flex items-center gap-2.5 px-4 py-3 border-b border-neutral-200 flex-wrap">
            <h2 class="text-sm font-semibold">marketplace</h2>
            <span class="hint mono">{counts().all} entries</span>
            <span class="flex-1"></span>
            <button class="btn btn-xs" onClick={mkCheck}>
              check state
            </button>
            <label class="btn btn-xs cursor-pointer">
              upload zip
              <input
                type="file"
                accept=".zip"
                class="hidden"
                ref={(el) => (refs.mkFile = el)}
                onChange={mkUpload}
              />
            </label>
            <button
              class="btn btn-xs"
              onClick={() => {
                mkShowAdd(true);
                mkMsg("describe your app and copy the agent prompt");
              }}
            >
              add app
            </button>
            <button class="btn btn-xs" onClick={closeMarket}>
              close
            </button>
          </div>
          <div class="px-4 py-2 border-b border-neutral-100 flex items-center gap-3 flex-wrap">
            <span class="hint">on vm:</span>
            <span class="flex items-center gap-1.5 flex-wrap">
              <SessPills />
            </span>
          </div>
          <div class="flex flex-1 min-h-0">
            <aside class="w-44 border-r border-neutral-200 p-2 flex flex-col gap-0.5">
              <For each={CATS}>
                {(k) => (
                  <button
                    class="cat"
                    classList={{ on: mcat() === k }}
                    onClick={() => mkSetCat(k)}
                  >
                    {k} <span>{counts()[k]}</span>
                  </button>
                )}
              </For>
              <div class="mt-auto hint p-2 leading-relaxed">
                uploaded zips stay listed permanently; community entries are contributed by other
                people.
              </div>
            </aside>
            <div class="flex-1 min-w-0 overflow-y-auto p-3">
              <div
                class="grid gap-2.5"
                style="grid-template-columns:repeat(auto-fill,minmax(238px,1fr))"
                classList={{ hidden: mkAdd() }}
              >
                <Show
                  when={items().length}
                  fallback={
                    <p class="hint col-span-full p-3">
                      nothing here yet
                      {mcat() === "community"
                        ? ' \u2014 use "add app" to publish the first entry'
                        : ""}
                    </p>
                  }
                >
                  <For each={items()}>
                    {(it) => (it.kind === "community" ? communityCard(it) : uploadCard(it))}
                  </For>
                </Show>
              </div>
              <div class="max-w-2xl space-y-3" classList={{ hidden: !mkAdd() }}>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="name (lowercase id)"
                    class="inp"
                    ref={(el) => (refs.mkName = el)}
                  />
                  <input
                    type="text"
                    placeholder="display title"
                    class="inp"
                    ref={(el) => (refs.mkTitle = el)}
                  />
                  <select class="inp" ref={(el) => (refs.mkCat = el)}>
                    <option value="apps">apps</option>
                    <option value="extensions">extensions</option>
                    <option value="tools">tools</option>
                  </select>
                  <input
                    type="text"
                    placeholder="https://github.com/you/repo"
                    class="inp"
                    ref={(el) => (refs.mkUrl = el)}
                  />
                </div>
                <input
                  type="text"
                  placeholder="description (160 chars)"
                  class="inp w-full"
                  ref={(el) => (refs.mkDesc = el)}
                />
                <div class="flex gap-2">
                  <button class="btn btn-p" onClick={(e) => mkSubmit(e.currentTarget)}>
                    submit to community
                  </button>
                  <button class="btn" onClick={() => mkShowAdd(false)}>
                    cancel
                  </button>
                </div>
                <div class="border border-neutral-200 rounded-lg p-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="ph">agent prompt — copy to your build agent</span>
                    <button class="btn btn-xs" onClick={(e) => mkCopy(e.currentTarget)}>
                      copy
                    </button>
                  </div>
                  <textarea
                    readonly
                    class="mono text-[11px] w-full h-56 border border-neutral-200 rounded p-2.5 bg-neutral-50 whitespace-pre-wrap"
                    value={PROMPT}
                    ref={(el) => (refs.mkPrompt = el)}
                  ></textarea>
                  <p class="hint mt-2">
                    test loop: upload -&gt; install -&gt; launch -&gt; exercise -&gt; stop -&gt;
                    {" "}delete. Only submit after the flow works on a real session.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="border-t border-neutral-200 px-4 py-2 mono text-[11px] text-neutral-600">
            {mkMsgText()}
          </div>
        </div>
      </div>
    </Show>
  );
}
