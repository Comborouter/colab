import { Show, createSignal, createEffect, onCleanup, onMount } from "solid-js";
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
  connectModalOpen,
  launchApp,
  nsOpen,
} from "../store.js";

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
      if (a && (a.running || a.installing)) s += ep + ":" + name + ";";
    }
  }
  return s;
};

const STEPS = [
  {
    find: btn("Configure"),
    done: () => dashTab() === "configure",
    text: "Click Configure.",
  },
  {
    subtab: "providers",
    find: () =>
      [...document.querySelectorAll("button")].find((b) =>
        b.textContent.includes("+ Add provider")
      ),
    done: () => (state.profiles || []).length > 0,
    text: "Connect a provider.",
  },
  {
    tab: "apps",
    find: btn("marketplace"),
    done: () => mkOpen(),
    text: "Open the marketplace.",
  },
  {
    tab: "apps",
    find: () => {
      const modal = document.querySelector('[class*="min(1080px"]');
      const grid = modal && modal.querySelector(".grid");
      if (!grid) return null;
      const buttons = [...grid.querySelectorAll("button")];
      return (
        buttons.find((b) => b.textContent.trim() === "launch") ||
        buttons.find((b) => {
          const t = b.textContent.trim();
          return t === "install" || t === "retry install";
        }) ||
        null
      );
    },
    resume: () => {
      if (!mkOpen()) setMkOpen(true);
    },
    clickLabel: "launch",
    done: (base) => launchKey() !== base,
    text: "Install or launch an app.",
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

  const busy = function () {
    return connectModalOpen() || launchApp() || nsOpen();
  };

  const advance = function () {
    setStep(step() + 1);
    setRect(null);
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
    const s = STEPS[step()];
    if (!s) {
      finish();
      return;
    }
    if (s.done(base()) || clickHit()) {
      advance();
      return;
    }
    if (entered() !== step()) {
      setEntered(step());
      setBase(launchKey());
      setClickHit(false);
      if (s.tab && dashTab() !== s.tab) setDashTab(s.tab);
      if (s.subtab && configSubTab() !== s.subtab) setConfigSubTab(s.subtab);
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

  const reposition = function () {
    if (tourOpen()) setTick((t) => t + 1);
  };

  onMount(() => {
    const esc = (e) => {
      if (tourOpen() && e.key === "Escape") finish();
    };
    const click = (e) => {
      if (!tourOpen()) return;
      const s = STEPS[step()];
      if (!s || !s.clickLabel) return;
      const el = s.find();
      if (el && (el === e.target || el.contains(e.target))) setClickHit(true);
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
    <Show when={tourOpen() && rect() && !busy()}>
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
        <p class="text-[13.5px] leading-snug text-neutral-800">{STEPS[step()].text}</p>
        <div class="mt-3.5 flex items-center justify-between">
          <button
            class="text-[12.5px] text-neutral-500 hover:text-neutral-900"
            onClick={finish}
          >
            skip
          </button>
          <span class="text-[11px] text-neutral-400">
            {step() + 1}/{STEPS.length}
          </span>
        </div>
      </div>
    </Show>
  );
}
