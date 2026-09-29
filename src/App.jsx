import { Show } from "solid-js";
import { boot, claimed, route } from "./store.js";
import Login from "./views/Login.jsx";
import Dash from "./views/Dash.jsx";
import Workspace from "./views/Workspace.jsx";

export default function App() {
  return (
    <Show when={boot.authed || claimed()} fallback={<Login />}>
      <Show when={route() === "workspace"} fallback={<Dash />}>
        <Workspace />
      </Show>
    </Show>
  );
}
