import { appStates, pickEp } from "../store.js";

export default function StateCell(props) {
  const cell = () => {
    const ep = pickEp();
    if (!ep) return <span class="mono text-[10px] text-neutral-400">no vm</span>;
    const m = ep ? appStates[ep] : null;
    const st = m ? m[props.name] || null : null;
    if (!st) return <span class="mono text-[10px] text-neutral-400">…</span>;
    if (st.failed)
      return (
        <>
          <span class="mono text-[10px] font-semibold">failed</span>{" "}
          <span
            class="mono text-[10px] text-neutral-500"
            title={String(st.log || "").slice(-160)}
          >
            {String(st.log || "").slice(-70)}
          </span>
        </>
      );
    if (st.installing) return <span class="mono text-[10px]">installing…</span>;
    if (st.installed && st.running)
      return st.url ? (
        <a class="mono text-[10px] underline" href={st.url} target="_blank" rel="noopener">
          open
        </a>
      ) : (
        <span class="mono text-[10px]">running (waiting for tunnel)</span>
      );
    if (st.installed) return <span class="mono text-[10px] text-neutral-500">installed</span>;
    return <span class="mono text-[10px] text-neutral-400">not installed</span>;
  };
  return <>{cell()}</>;
}
