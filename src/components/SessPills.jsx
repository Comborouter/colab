import { For, Show } from "solid-js";
import { aliveSessions, pickEp } from "../store.js";
import { shortEp } from "../api.js";
import { vmPick } from "../actions.js";

export default function SessPills() {
  return (
    <Show
      when={aliveSessions().length}
      fallback={<span class="hint">no vm</span>}
    >
      <For each={aliveSessions()}>
        {(r) => {
          const on = () => r.endpoint === pickEp();
          return (
            <button
              class="btn btn-xs"
              classList={{ "btn-p": on() }}
              onClick={() => vmPick(r.endpoint)}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "99px",
                  background: on() ? "#fff" : "#22c55e",
                  display: "inline-block",
                }}
              ></span>
              {r.name || shortEp(r.endpoint)}
            </button>
          );
        }}
      </For>
    </Show>
  );
}
