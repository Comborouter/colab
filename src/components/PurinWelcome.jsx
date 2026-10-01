import { Show, createSignal } from "solid-js";
import { bootMsg, lsGet, lsSet } from "../store.js";

export default function PurinWelcome() {
  const [acked, setAcked] = createSignal(false);
  const show = function () {
    return !acked() && lsGet("purin_welcome") !== "1" && bootMsg() === null;
  };
  const close = function () {
    lsSet("purin_welcome", "1");
    setAcked(true);
  };
  return (
    <Show when={show()}>
      <div class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/30" onClick={close}></div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,94vw)] max-h-[88vh] overflow-y-auto bg-white border border-neutral-300 rounded-xl shadow-xl">
          <img
            src="/purin_profile.png"
            alt="Purin, the hippo mascot"
            class="w-full h-44 object-cover object-top border-b border-neutral-200"
          />
          <div class="p-5 space-y-3">
            <h2 class="text-[17px] font-semibold tracking-tight">Hi, I'm Purin!</h2>
            <p class="text-[13px] text-neutral-600 leading-relaxed">
              Welcome to combo. I'm your hippo helper - I'll keep you posted whenever
              something finishes, fails, or needs a nudge. Just watch this corner.
            </p>
            <ul class="space-y-1.5 text-[13px] text-neutral-700">
              <li class="flex gap-2">
                <span class="text-neutral-400">-</span>
                <span>
                  Spin up a VM with <span class="font-medium">New Session</span>
                </span>
              </li>
              <li class="flex gap-2">
                <span class="text-neutral-400">-</span>
                <span>
                  Grab apps from the <span class="font-medium">marketplace</span> - I'll
                  track the install
                </span>
              </li>
              <li class="flex gap-2">
                <span class="text-neutral-400">-</span>
                <span>Everything lands here as a toast</span>
              </li>
            </ul>
            <button class="btn btn-p w-full" onClick={close}>
              Got it!
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
}
