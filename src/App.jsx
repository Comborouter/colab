import { Show } from "solid-js";
import { Toaster } from "solid-toast";
import { boot, claimed, route } from "./store.js";
import Login from "./views/Login.jsx";
import Dash from "./views/Dash.jsx";
import Workspace from "./views/Workspace.jsx";

export default function App() {
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
