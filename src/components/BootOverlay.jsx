import { Show } from "solid-js";
import { bootMsg, setBootMsg, setClaimed } from "../store.js";

export default function BootOverlay() {
  return (
    <Show when={bootMsg() !== null}>
      <div class="fixed inset-0 z-50 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4">
        <Show
          when={String(bootMsg()).toLowerCase().includes("unauthorized")}
          fallback={
            <>
              <div class="spin spin-lg"></div>
              <p class="hint">{bootMsg()}</p>
              <button
                type="button"
                onClick={() => setBootMsg(null)}
                class="text-[11px] text-neutral-400 hover:text-neutral-700 underline mt-2 cursor-pointer"
              >
                dismiss
              </button>
            </>
          }
        >
          <div class="text-center max-w-sm p-6 bg-white border border-neutral-200 rounded-xl shadow-sm">
            <h2 class="text-sm font-semibold text-neutral-900 mb-1">Session expired</h2>
            <p class="text-xs text-neutral-500 mb-4">Your session has expired. Please sign in again.</p>
            <button
              type="button"
              onClick={() => {
                setBootMsg(null);
                setClaimed(false);
              }}
              class="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </Show>
      </div>
    </Show>
  );
}
