import { Show, createEffect } from "solid-js";
import { Toaster } from "solid-toast";
import { boot, claimed, route, state, consumePathWs, syncUrl } from "./store.js";
import { wsSwitch } from "./actions.js";
import Login from "./views/Login.jsx";
import Dash from "./views/Dash.jsx";
import Workspace from "./views/Workspace.jsx";

let wsPrimed = false;

export default function App() {
  createEffect(() => {
    const id = state.ws && state.ws.id;
    if (!id || wsPrimed) return;
    wsPrimed = true;
    const want = consumePathWs();
    if (want && want !== id) {
      if (sessionStorage.getItem("wsSwitchTried:" + want)) {
        sessionStorage.removeItem("wsSwitchTried:" + want);
        syncUrl(false);
        return;
      }
      const ms = state.ws.memberships || [];
      if (ms.some(function (m) { return m.wsid === want; })) {
        wsSwitch(want);
        return;
      }
    } else if (want) {
      sessionStorage.removeItem("wsSwitchTried:" + want);
    }
    syncUrl(false);
  });
  return (
    <>
      <Show when={boot.authed || claimed()} fallback={<Login />}>
        <Show when={route() === "workspace"} fallback={<Dash />}>
          <Workspace />
        </Show>
      </Show>
      <Toaster
        position="bottom-right"
        gutter={10}
        toastOptions={{
          duration: 4500,
          style: {
            background: "transparent",
            color: "#111",
            boxShadow: "none",
            padding: 0,
            border: "none",
          },
        }}
      />
    </>
  );
}
