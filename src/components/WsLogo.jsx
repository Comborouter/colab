import { Show } from "solid-js";

export default function WsLogo(props) {
  const size = () => props.size || 20;
  const initial = () => (((props.name || "?").trim().slice(0, 1) || "?").toUpperCase());
  const px = () => "width:" + size() + "px;height:" + size() + "px;";
  return (
    <Show
      when={props.logo}
      fallback={
        <span
          class="flex items-center justify-center rounded-md bg-neutral-900 text-white font-semibold shrink-0"
          style={px() + "font-size:" + Math.round(size() * 0.55) + "px"}
        >
          {initial()}
        </span>
      }
    >
      <img
        src={props.logo}
        alt=""
        class="rounded-md object-cover shrink-0"
        style={px()}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
    </Show>
  );
}
