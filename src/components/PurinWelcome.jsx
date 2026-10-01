import { Show, createSignal } from "solid-js";
import { bootMsg, lsGet, lsSet, setTourOpen } from "../store.js";

export default function PurinWelcome() {
  const [acked, setAcked] = createSignal(false);
  const show = function () {
    return !acked() && lsGet("purin_welcome") !== "1" && bootMsg() === null;
  };
  const close = function () {
    lsSet("purin_welcome", "1");
    setAcked(true);
    if (lsGet("purin_tour") !== "1") setTourOpen(true);
  };
  return (
    <Show when={show()}>
      <div class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/30" onClick={close}></div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,94vw)] max-h-[88vh] overflow-y-auto bg-white border border-neutral-300 rounded-xl shadow-xl">
          <div class="p-5">
            <img
              src="/purin_profile.png"
              alt="Purin the hippo mascot"
              class="w-[56%] mx-auto rounded-md object-cover object-top"
            />
            <div class="mt-2 text-[15px] font-semibold text-center text-neutral-900">
              purin-chan(プリンちゃん)
            </div>
            <p class="mt-5 text-[14.5px] leading-relaxed text-center text-neutral-800">
              I'm Purin, here to help.
            </p>
            <div class="mt-7 flex justify-center">
              <button
                class="px-9 py-2.5 border-2 border-neutral-900 rounded-full text-[15px] font-medium bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white transition"
                onClick={close}
              >
                はい
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
