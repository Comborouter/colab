import { Show } from "solid-js";
import { boot } from "./store.js";
import Login from "./views/Login.jsx";
import Dash from "./views/Dash.jsx";

export default function App() {
  return (
    <Show when={boot.authed} fallback={<Login />}>
      <Dash />
    </Show>
  );
}
