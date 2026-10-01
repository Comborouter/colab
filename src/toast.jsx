import toast from "solid-toast";

const ERR_RE = /\berror|failed|failure|unauthorized|not found|no machine/i;

export function purinNotify(text) {
  const t = String(text == null ? "" : text);
  if (!t) return;
  const isErr = ERR_RE.test(t);
  toast.custom(
    (x) => (
      <div
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
    ),
    { duration: isErr ? 6000 : 4500 }
  );
}
