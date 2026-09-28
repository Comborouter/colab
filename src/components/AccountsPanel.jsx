import { For, Show } from "solid-js";
import { state, codeOpen, refreshTick, refs } from "../store.js";
import { startConnect, submitCode, removeProfile } from "../actions.js";

export default function AccountsPanel() {
  const auth = () => state.auth || {};
  const profiles = () => state.profiles || [];
  const tokenLine = () => {
    refreshTick();
    const a = auth();
    if (!a.hasTokens) return "not connected";
    const mins = Math.round((a.expiry - Date.now()) / 60000);
    return mins > 0 ? "token " + mins + "m" : "token expired";
  };
  return (
    <section class="border border-neutral-200 rounded-lg">
      <div class="flex items-center justify-between px-3.5 py-2 border-b border-neutral-200">
        <span class="ph">colab accounts</span>
        <span class="hint">{tokenLine()}</span>
      </div>
      <div class="p-3.5 space-y-2">
        <div class="flex items-center gap-2 flex-wrap">
          <Show
            when={auth().hasTokens}
            fallback={
              <button class="btn btn-p" onClick={startConnect}>
                connect colab
              </button>
            }
          >
            <span class="text-[11px] font-medium">connected</span>
            <span class="hint">{profiles().length} account(s)</span>
            <button class="btn btn-xs" onClick={startConnect}>
              add account
            </button>
          </Show>
        </div>
        <Show when={codeOpen()}>
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="paste authorization code"
              class="inp flex-1"
              ref={(el) => (refs.codeInput = el)}
            />
            <button class="btn" onClick={(e) => submitCode(e.currentTarget)}>
              authorize
            </button>
          </div>
        </Show>
        <div class="space-y-1">
          <For each={profiles()}>
            {(p) => (
              <div class="flex items-center gap-2 text-xs py-0.5">
                <span class="text-neutral-600">{p.email}</span>
                <Show when={p.expiry && p.expiry < Date.now()}>
                  <span class="hint">(token expired)</span>
                </Show>
                <span class="flex-1"></span>
                <button
                  class="btn btn-xs"
                  title="remove account"
                  onClick={() => removeProfile(p.email)}
                >
                  ×
                </button>
              </div>
            )}
          </For>
        </div>
        <p class="hint">
          {auth().hasTokens
            ? "pick an account per session when creating a VM; every account is keep-alive'd"
            : "opens Google consent, paste the code it shows"}
        </p>
      </div>
    </section>
  );
}
