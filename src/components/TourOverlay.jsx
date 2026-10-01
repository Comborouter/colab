import { Show, createSignal, createEffect, onCleanup, onMount } from "solid-js";
import {
  lsSet,
  tourOpen,
  setTourOpen,
  dashTab,
  setDashTab,
  configSubTab,
  setConfigSubTab,
} from "../store.js";
import { openMarket } from "../actions.js";

const btn = function (label) {
  return () =>
    [...document.querySelectorAll("button")].find(
      (b) => b.textContent.trim() === label
    );
};

const STEPS = [
  {
    find: btn("Configure"),
    text: "Workspace settings live here.",
  },
  {
    tab: "configure",
    subtab: "providers",
    find: () =>
      [...document.querySelectorAll("button")].find((b) =>
        b.textContent.includes("+ Add provider")
      ),
    text: "Connect a provider.",
  },
  {
    tab: "apps",
    enter: openMarket,
    find: () =>
      [...document.querySelectorAll("h2")].find(
        (h) => h.textContent.trim() === "marketplace"
      ),
    text: "Browse the marketplace.",
  },
  {
    tab: "apps",
    find: () => {
      const modal = document.querySelector('[class*="min(1080px"]');
      const grid = modal && modal.querySelector(".grid");
      if (!grid) return null;
      return [...grid.querySelectorAll("button")].find((b) => {
        const t = b.textContent.trim();
        return t === "install" || t === "retry install" || t === "launch";
      });
    },
    text: "Install, then launch.",
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
  const [misses, setMisses] = createSignal(0);
  const [entered, setEntered] = createSignal(-1);

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
    if (s.tab && dashTab() !== s.tab) {
      setDashTab(s.tab);
      return;
    }
    if (s.subtab && configSubTab() !== s.subtab) {
      setConfigSubTab(s.subtab);
      return;
    }
    if (entered() !== step()) {
      setEntered(step());
      if (s.enter) s.enter();
      return;
    }
    const r = measure(s);
    if (!r) {
      if (misses() < 6) {
        setMisses(misses() + 1);
        setTimeout(() => setTick((t) => t + 1), 150);
        return;
      }
      setMisses(0);
      setStep(step() + 1);
      return;
    }
    setMisses(0);
    setRect(r);
  });

  const reposition = function () {
    if (tourOpen()) setTick((t) => t + 1);
  };

  onMount(() => {
    const esc = (e) => {
      if (tourOpen() && e.key === "Escape") finish();
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("keydown", esc);
    onCleanup(() => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("keydown", esc);
    });
  });

  const popupPos = function () {
    const r = rect();
    if (!r) return "left:0;top:0";
    const w = 300;
    const h = 132;
    let top = r.top + r.height + 12;
    if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 12);
    let left = r.left + r.width / 2 - w / 2;
    left = Math.min(Math.max(12, left), window.innerWidth - w - 12);
    return "left:" + Math.round(left) + "px;top:" + Math.round(top) + "px";
  };

  const next = function () {
    if (step() >= STEPS.length - 1) finish();
    else setStep(step() + 1);
  };

  return (
    <Show when={tourOpen() && rect()}>
      <div class="fixed inset-0 z-[45]">
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
        class="fixed z-[60] w-[300px] bg-white border border-neutral-300 rounded-xl shadow-xl p-4"
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
          <div class="flex items-center gap-3">
            <span class="text-[11px] text-neutral-400">
              {step() + 1}/{STEPS.length}
            </span>
            <button
              class="px-4 py-1.5 text-[13px] font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-700"
              onClick={next}
            >
              {step() >= STEPS.length - 1 ? "done" : "next"}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
