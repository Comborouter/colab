import { createEffect } from "solid-js";
import toast from "solid-toast";

const ERR_RE = /\berror|failed|failure|unauthorized|not found|no machine/i;

const IN_FRAMES = [
  { transform: "translate3d(0,200%,0) scale(.6)", opacity: 0.5 },
  { transform: "translate3d(0,0,0) scale(1)", opacity: 1 },
];
const OUT_FRAMES = [
  { transform: "translate3d(0,0,-1px) scale(1)", opacity: 1 },
  { transform: "translate3d(0,150%,-1px) scale(.4)", opacity: 0 },
];

export function purinNotify(text) {
  const t = String(text == null ? "" : text);
  if (!t) return;
  const isErr = ERR_RE.test(t);
  toast.custom(
    (x) => {
      let el;
      createEffect(() => {
        if (!el) return;
        if (x.visible) {
          el.animate(IN_FRAMES, {
            duration: 350,
            fill: "forwards",
            easing: "cubic-bezier(.21,1.02,.73,1)",
          });
        } else {
          el.animate(OUT_FRAMES, {
            duration: 400,
            fill: "forwards",
            easing: "cubic-bezier(.06,.71,.55,1)",
          });
        }
      });
      return (
        <div
          ref={el}
          onClick={() => toast.dismiss(x.id)}
          class={
            "flex items-start gap-3.5 w-[400px] max-w-full bg-white border border-neutral-200 rounded-xl shadow-lg px-4 py-3.5 cursor-pointer border-l-4 " +
            (isErr ? "border-l-red-500" : "border-l-neutral-900")
          }
        >
          <img
            src="/purin_bubble.png"
            alt="Purin"
            class="h-16 w-16 rounded-lg object-cover shrink-0 border border-neutral-200"
          />
          <div
            class={
              "text-[14px] leading-snug break-words " +
              (isErr ? "text-red-600" : "text-neutral-800")
            }
          >
            {t}
          </div>
        </div>
      );
    },
    { duration: isErr ? 6000 : 4500 }
  );
}
