import { For, Show } from "solid-js";
import { state, nsOpen, nsLogText, nsProfile, refs, setNsProfile } from "../store.js";
import { lsSet } from "../store.js";
import { closeNS, nsCreate, startConnect, submitCode, openConnectModal } from "../actions.js";

const ACCELS = [
  ["NONE", "CPU"],
  ["T4", "T4"],
  ["L4", "L4"],
  ["G4", "G4"],
  ["A100", "A100"],
  ["H100", "H100"],
  ["V5E1", "TPU v5e"],
  ["V6E1", "TPU v6e"],
];

export default function NewSessModal() {
  const profiles = () => state.profiles || [];
  const profValue = () => {
    const cur = nsProfile();
    if (profiles().some(function (p) { return p.email === cur; })) return cur;
    return profiles()[0] ? profiles()[0].email : "";
  };
  return (
    <Show when={nsOpen()}>
      <div class="fixed inset-0 z-[60]">
        <div class="absolute inset-0 bg-black/30" onClick={closeNS}></div>
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(470px,94vw)] bg-white border border-neutral-300 rounded-xl shadow-xl">
          <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <span class="text-sm font-semibold">new session</span>
            <button class="btn btn-xs" onClick={closeNS}>
              close
            </button>
          </div>
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-[86px_1fr] gap-x-3 gap-y-2.5 items-center text-xs">
              <span class="hint text-right">name</span>
              <input
                placeholder="optional"
                class="inp w-full"
                ref={(el) => (refs.nsName = el)}
              />
              <span class="hint text-right">provider</span>
              <select class="inp w-full" ref={(el) => (refs.nsProvider = el)}>
                <option value="colab">google colab</option>
              </select>
              <span class="hint text-right">machine</span>
              <select class="inp w-full" ref={(el) => (refs.nsAccel = el)}>
                <For each={ACCELS}>
                  {([v, label]) => <option value={v}>{label}</option>}
                </For>
              </select>
              <span class="hint text-right">memory</span>
              <label class="flex items-center gap-2">
                <input type="checkbox" ref={(el) => (refs.nsHm = el)} />
                <span class="hint">high-mem</span>
              </label>
              <span class="hint text-right">provider</span>
              <Show
                when={profiles().length}
                fallback={
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="btn btn-xs btn-p"
                      onClick={() => openConnectModal("colab")}
                    >
                      + Connect Google Colab
                    </button>
                    <span class="hint">No account connected</span>
                  </div>
                }
              >
              <select
                class="inp w-full"
                value={profValue()}
                onChange={(e) => {
                  setNsProfile(e.currentTarget.value);
                  lsSet("nsProfile", e.currentTarget.value);
                }}
                ref={(el) => (refs.nsProfile = el)}
              >
                <For each={profiles()}>
                  {(p) => <option value={p.email}>{p.email}</option>}
                </For>
              </select>
              </Show>
            </div>
            <div class="flex justify-end">
              <button class="btn btn-p" onClick={(e) => nsCreate(e.currentTarget)}>
                create session
              </button>
            </div>
            <p class="hint text-[10px]">assignment can take up to a minute</p>
            <pre class="mono text-[11px] h-32 overflow-y-auto border border-neutral-200 rounded-md p-2.5 bg-neutral-50 text-neutral-700 whitespace-pre-wrap m-0">
              {nsLogText()}
            </pre>
          </div>
        </div>
      </div>
    </Show>
  );
}
