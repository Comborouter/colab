import { For, Show, createSignal } from "solid-js";
import { bootMsg, lsGet, lsSet } from "../store.js";

const EQ_BARS = [100, 88, 76, 64, 52, 41, 31, 21, 12];

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
          <div class="p-5">
            <div class="flex items-start gap-4">
              <img
                src="/purin_profile.png"
                alt="Purin the hippo mascot"
                class="w-[54%] rounded-md object-cover object-top"
              />
              <div class="flex-1 self-stretch bg-neutral-950 rounded-md flex items-end justify-center gap-[5px] p-2">
                <For each={EQ_BARS}>
                  {(h, i) => (
                    <div
                      class="w-2.5 rounded-sm bg-neutral-700 overflow-hidden"
                      style={"height:" + h + "%"}
                    >
                      <span
                        class="block w-full h-full bg-white purin-eq-bar"
                        style={"animation-delay:" + (i() * 0.12).toFixed(2) + "s"}
                      ></span>
                    </div>
                  )}
                </For>
              </div>
            </div>
            <div class="mt-2 text-[15px] text-neutral-900">purin-chan(プリンちゃん)</div>
            <p class="mt-5 text-[14.5px] leading-relaxed text-neutral-800">
              Welcome to combo! I'm your hippo helper. Spin up a VM, grab apps from the
              marketplace - I'll track every install. Anything that finishes, fails or
              needs a nudge lands right here as a toast. Just watch this corner.
            </p>
            <div class="mt-7 flex justify-center">
              <button
                class="px-9 py-2.5 border-2 border-neutral-900 rounded-full text-[15px] font-medium bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white transition"
                onClick={close}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
