import { Show } from "solid-js";
import { bootMsg } from "../store.js";

export default function BootOverlay() {
  return (
    <Show when={bootMsg() !== null}>
      <div class="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center gap-3">
        <div class="spin spin-lg"></div>
        <p class="hint">{bootMsg()}</p>
      </div>
    </Show>
  );
}
