import { Show } from "solid-js";
import { vmModal, setVmModal, state } from "../store.js";
import { stopSess, renameSess } from "../actions.js";
import { shortEp } from "../api.js";
import { refs } from "../store.js";

export default function ConfigureVmModal() {
  const vm = () => {
    const ep = vmModal();
    if (!ep) return null;
    return (state.sessions || []).find(function (r) {
      return r.endpoint === ep;
    });
  };
  return (
    <Show when={vmModal()}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div class="flex items-start justify-between px-7 pt-6 pb-2">
            <h2 class="text-[22px] font-semibold tracking-tight text-neutral-900">
              Configure {(vm() && vm().name) || "VM"}
            </h2>
            <button
              class="rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
              aria-label="Close"
              onClick={() => setVmModal("")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          <div class="space-y-4 px-7 py-5">
            <p class="mono text-[11px] text-neutral-500">
              {shortEp(vmModal())}
              {(vm() && vm().accelerator ? " · " + vm().accelerator : "")}
            </p>
            <div class="space-y-2">
              <label class="block text-[15px] font-medium text-neutral-900">Name</label>
              <div class="flex gap-2">
                <input
                  type="text"
                  placeholder={(vm() && vm().name) || "VM name"}
                  maxlength="64"
                  class="w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-neutral-900"
                  ref={(el) => (refs.vmRename = el)}
                />
                <button
                  class="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-[15px] font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50 shrink-0"
                  onClick={() => {
                    const input = refs.vmRename;
                    const v = input ? input.value.trim() : "";
                    if (v) renameSess(vmModal(), v);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-1">
              <button
                class="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-[15px] font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
                onClick={() => setVmModal("")}
              >
                Cancel
              </button>
              <button
                class="rounded-lg bg-neutral-900 px-4 py-2.5 text-[15px] font-medium text-white shadow-sm transition hover:bg-neutral-700"
                onClick={() => stopSess(vmModal())}
              >
                Stop session
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
