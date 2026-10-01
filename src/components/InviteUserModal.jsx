import { Show, createSignal, onCleanup } from "solid-js";
import { api } from "../api.js";
import { msg } from "../actions.js";

export default function InviteUserModal(props) {
  const [role, setRole] = createSignal("member");
  const [loading, setLoading] = createSignal(false);
  const [inviteUrl, setInviteUrl] = createSignal("");
  const [copied, setCopied] = createSignal(false);
  const [error, setError] = createSignal("");

  function handleClose() {
    setRole("member");
    setInviteUrl("");
    setCopied(false);
    setError("");
    props.onClose();
  }

  async function handleCopy() {
    if (!inviteUrl()) return;
    try {
      await navigator.clipboard.writeText(inviteUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await api("/api/ws/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: role() }),
      });

      let url = res && res.url;
      if (!url) {
        setError("Backend did not return an invite url.");
        return;
      }

      setInviteUrl(url);
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url).catch(() => {});
        setCopied(true);
      }

      msg("Invite link copied to clipboard!");

      if (props.onInviteCreated) {
        props.onInviteCreated({
          email: "",
          role: role(),
          url: url,
          created_at: "Just now",
          status: "Pending",
        });
      }
    } catch (err) {
      setError((err && err.message) || "Invite failed");
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && props.isOpen()) {
      handleClose();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
  }

  return (
    <Show when={props.isOpen()}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div
          class="w-full max-w-[420px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-slide-down space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div>
            <h2 class="text-[17px] font-semibold tracking-[-0.02em] text-neutral-900">
              Invite user
            </h2>
            <p class="mt-1 text-xs text-neutral-500">
              Generate a link to invite someone to this workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} class="space-y-4">
            {/* Role Field */}
            <div>
              <label class="block text-xs font-semibold text-neutral-900 mb-1.5">
                Role
              </label>
              <div class="relative">
                <select
                  value={role()}
                  onChange={(e) => setRole(e.currentTarget.value)}
                  class="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-black/5 pr-10 cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <div class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            <Show when={error()}>
              <p class="text-xs text-red-600">{error()}</p>
            </Show>

            {/* Success URL Box */}
            <Show when={inviteUrl()}>
              <div class="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2 animate-fade-in">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-emerald-900">
                    Invite link generated (7 days valid)
                  </span>
                  <span class="text-[11px] font-semibold text-emerald-700">
                    {copied() ? "Copied!" : ""}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    readonly
                    value={inviteUrl()}
                    class="w-full rounded border border-emerald-200 bg-white px-2 py-1 text-xs font-mono text-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    class="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 shrink-0 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </Show>

            {/* Action Buttons */}
            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleClose}
                class="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading()}
                class="rounded-lg bg-[#635BFF] hover:bg-[#534ae8] px-5 py-2 text-xs font-medium text-white shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Show when={loading()}>
                  <span class="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                </Show>
                <span>{inviteUrl() ? "Generate another" : "Generate link"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
}
