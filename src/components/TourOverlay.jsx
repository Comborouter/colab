import { Show, For, createSignal, createEffect, onCleanup, onMount } from "solid-js";
import {
  lsSet,
  tourOpen,
  setTourOpen,
  dashTab,
  setDashTab,
  configSubTab,
  setConfigSubTab,
  state,
  appStates,
  mkOpen,
  setMkOpen,
  mkAdd,
  setMkAdd,
  setMcat,
  connectModalOpen,
  launchApp,
  nsOpen,
} from "../store.js";

const IMG_EXPLAIN = "/purin_profile_explain.png";
const IMG_SUCCESS = "/purin_profile_explain_success.png";

const btn = function (label) {
  return () =>
    [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === label
    );
};

const launchKey = function () {
  let s = "";
  for (const ep in appStates) {
    const m = appStates[ep] || {};
    for (const name in m) {
      const a = m[name];
      if (a && (a.running || a.installing || a.installed)) s += ep + ":" + name + ";";
    }
  }
  return s;
};

const cardButton = function (re) {
  const modal = document.querySelector('[class*="min(1080px"]');
  const grid = modal && modal.querySelector(".grid");
  if (!grid) return null;
  for (const card of grid.children) {
    const nameEl = card.querySelector(".mono");
    const nm = nameEl ? nameEl.textContent.trim().toLowerCase() : "";
    if (!nm || !re.test(nm)) continue;
    const buttons = [...card.querySelectorAll("button")];
    const b =
      buttons.find((x) => x.textContent.trim() === "launch") ||
      buttons.find((x) => {
        const t = x.textContent.trim();
        return t === "install" || t === "retry install";
      });
    if (b) return b;
  }
  return null;
};

const openMarketClean = function () {
  setMcat("all");
  if (!mkOpen()) setMkOpen(true);
  if (mkAdd()) setMkAdd(false);
};

const NODES = [
  {
    type: "talk",
    img: IMG_EXPLAIN,
    paras: [
      "I'm going to show you how to use combo to launch a VM and run an app.",
      "Before we can start an app or a VM, we need to connect a provider. Let's go!",
    ],
  },
  {
    type: "talk",
    img: IMG_EXPLAIN,
    tab: "configure",
    subtab: "providers",
    paras: [
      "Many compute providers live here. \u3054\u3081\u3093\u306d\u2026 we're still working on getting the rest ready.",
    ],
  },
  {
    type: "task",
    tab: "configure",
    subtab: "providers",
    find: () =>
      [...document.querySelectorAll("button")].find((b) =>
        b.textContent.includes("+ Add provider")
      ),
    done: () => (state.profiles || []).length > 0,
    text: "Connect a provider.",
  },
  {
    type: "talk",
    img: IMG_EXPLAIN,
    tab: "overview",
    paras: [
      "Start a new session by clicking New Session \u2014 you can also invoke it from the marketplace.",
    ],
  },
  {
    type: "task",
    tab: "overview",
    find: btn("New Session"),
    key: () => String((state.sessions || []).length),
    done: (base) => (state.sessions || []).length > (Number(base) || 0),
    text: "Create your VM.",
  },
  {
    type: "talk",
    img: IMG_SUCCESS,
    paras: ["Great! Let's move on to the marketplace."],
  },
  {
    type: "talk",
    img: IMG_EXPLAIN,
    paras: ["Launch Comfy UI and add the Hunyuan image-to-3D extension."],
  },
  {
    type: "task",
    tab: "apps",
    find: () => cardButton(/^comfyui$/),
    resume: openMarketClean,
    key: launchKey,
    done: (base) => launchKey() !== base,
    clickLabel: "launch",
    text: "Install Comfy UI.",
  },
  {
    type: "task",
    tab: "apps",
    find: () => cardButton(/^comfyui-hunyuan3d-2$/),
    resume: openMarketClean,
    key: launchKey,
    done: (base) => launchKey() !== base,
    clickLabel: "launch",
    text: "Add the extension.",
  },
  {
    type: "talk",
    img: IMG_SUCCESS,
    paras: ["Great, your app is running!"],
  },
  {
    type: "talk",
    img: IMG_SUCCESS,
    paras: [
      "This is your personal workspace \u2014 you can share and invite friends and family to run or view apps from here.",
    ],
  },
];

const finish = function () {
  lsSet("purin_tour", "1");
  setTourOpen(false);
};

export default function TourOverlay() {
  const [step, setStep] = createSignal(0);
  const [rect, setRect] = createSignal(null);
  const [tick, setTick] = createSignal(0);
  const [entered, setEntered] = createSignal(-1);
  const [base, setBase] = createSignal("");
  const [clickHit, setClickHit] = createSignal(false);

  const node = () => NODES[step()] || null;

  if (import.meta.env.DEV) {
    window.__tour = {
      step,
      entered,
      rect,
      base,
      clickHit,
      nodeType: () => (node() ? node().type : null),
      nodeText: () => (node() && node().text) || (node() && node().paras && node().paras[0]) || null,
      probeFind: () => (node() && node().find ? !!node().find() : "no-find"),
      probeEntered: () => entered(),
    };
  }

  const busy = function () {
    return connectModalOpen() || launchApp() || nsOpen();
  };

  const advance = function () {
    setStep(step() + 1);
    setRect(null);
  };

  const talkNext = function () {
    if (step() >= NODES.length - 1) finish();
    else advance();
  };

  const measure = function (s) {
    const el = s.find();
    if (!el) return null;
    let r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return null;
    if (r.top < 72 || r.bottom > window.innerHeight - 24) {
      el.scrollIntoView({ block: "center", behavior: "instant" });
      r = el.getBoundingClientRect();
    }
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  };

  createEffect(() => {
    if (!tourOpen()) return;
    tick();
    const s = NODES[step()];
    if (!s) {
      finish();
      return;
    }
    if (entered() !== step()) {
      setEntered(step());
      setBase(s.key ? s.key() : "");
      setClickHit(false);
      if (s.tab && dashTab() !== s.tab) setDashTab(s.tab);
      if (s.subtab && configSubTab() !== s.subtab) setConfigSubTab(s.subtab);
    }
    if (s.type === "talk") {
      setRect(null);
      return;
    }
    if (s.done(base()) || clickHit()) {
      advance();
      return;
    }
    const r = measure(s);
    if (!r) {
      if (s.tab && dashTab() !== s.tab) {
        setDashTab(s.tab);
        return;
      }
      if (s.subtab && configSubTab() !== s.subtab) {
        setConfigSubTab(s.subtab);
        return;
      }
      if (s.resume) {
        s.resume();
        return;
      }
      setTimeout(() => setTick((t) => t + 1), 400);
      return;
    }
    setRect(r);
  });

  createEffect(() => {
    if (!tourOpen()) return;
    const id = setInterval(() => setTick((t) => t + 1), 350);
    onCleanup(() => clearInterval(id));
  });

  const reposition = function () {
    if (tourOpen()) setTick((t) => t + 1);
  };

  onMount(() => {
    const esc = (e) => {
      if (tourOpen() && e.key === "Escape") finish();
    };
    const click = (e) => {
      if (!tourOpen()) return;
      const s = NODES[step()];
      if (!s || !s.clickLabel) return;
      const el = s.find();
      if (
        el &&
        el.textContent.trim() === s.clickLabel &&
        (el === e.target || el.contains(e.target))
      )
        setClickHit(true);
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("keydown", esc);
    window.addEventListener("click", click, true);
    onCleanup(() => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("keydown", esc);
      window.removeEventListener("click", click, true);
    });
  });

  const popupPos = function () {
    const r = rect();
    if (!r) return "left:0;top:0";
    const w = 300;
    const h = 116;
    let top = r.top + r.height + 12;
    if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 12);
    let left = r.left + r.width / 2 - w / 2;
    left = Math.min(Math.max(12, left), window.innerWidth - w - 12);
    return "left:" + Math.round(left) + "px;top:" + Math.round(top) + "px";
  };

  return (
    <Show when={tourOpen()}>
      <Show when={node() && node().type === "talk" && !busy()}>
        <div class="fixed inset-0 z-[60]">
          <div class="absolute inset-0 bg-black/30"></div>
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,94vw)] max-h-[88vh] overflow-y-auto bg-white border border-neutral-300 rounded-xl shadow-xl">
            <div class="p-5">
              <img
                src={node().img}
                alt="Purin the hippo mascot"
                class="w-[52%] mx-auto rounded-md object-cover object-top"
              />
              <For each={node().paras}>
                {(p) => (
                  <p class="mt-4 text-[14.5px] leading-relaxed text-center text-neutral-800">
                    {p}
                  </p>
                )}
              </For>
              <div class="mt-6 flex justify-center">
                <button
                  class="px-9 py-2.5 border-2 border-neutral-900 rounded-full text-[15px] font-medium bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white transition"
                  onClick={talkNext}
                >
                  はい
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
      <Show when={node() && node().type === "task" && rect() && !busy()}>
        <div class="fixed inset-0 z-[45] pointer-events-none">
          <div
            class="absolute border-2 border-white rounded-lg"
            style={
              "left:" +
              Math.round(rect().left - 3) +
              "px;top:" +
              Math.round(rect().top - 3) +
              "px;width:" +
              Math.round(rect().width + 6) +
              "px;height:" +
              Math.round(rect().height + 6) +
              "px;box-shadow:0 0 0 9999px rgba(0,0,0,0.5)"
            }
          ></div>
        </div>
        <div
          class="fixed z-[60] w-[300px] bg-white border border-neutral-300 rounded-xl shadow-xl p-4 pointer-events-auto"
          style={popupPos()}
        >
          <p class="text-[13.5px] leading-snug text-neutral-800">{node().text}</p>
          <div class="mt-3.5 flex items-center justify-between">
            <button
              class="text-[12.5px] text-neutral-500 hover:text-neutral-900"
              onClick={finish}
            >
              skip
            </button>
            <span class="text-[11px] text-neutral-400">
              {step() + 1}/{NODES.length}
            </span>
          </div>
        </div>
      </Show>
    </Show>
  );
}
