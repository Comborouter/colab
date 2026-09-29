import { createSignal, createEffect, Show } from "solid-js";
import { state, setState, refs } from "../store.js";
import { api } from "../api.js";
import { wsSaveLogo, refresh, msg } from "../actions.js";
import WsLogo from "./WsLogo.jsx";

export default function WorkspaceSettings() {
  const ws = () => state.ws || {};

  const [name, setName] = createSignal("");
  const [supportEmail, setSupportEmail] = createSignal("");
  const [removeBranding, setRemoveBranding] = createSignal(false);
  const [logoPreview, setLogoPreview] = createSignal("");
  const [faviconPreview, setFaviconPreview] = createSignal("");
  const [copiedId, setCopiedId] = createSignal(false);
  const [savingName, setSavingName] = createSignal(false);
  const [savedNameNotice, setSavedNameNotice] = createSignal(false);
  const [savingEmail, setSavingEmail] = createSignal(false);
  const [savedEmailNotice, setSavedEmailNotice] = createSignal(false);

  // Transfer / Delete dialog states
  const [showTransferModal, setShowTransferModal] = createSignal(false);
  const [transferEmail, setTransferEmail] = createSignal("");
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [deleteConfirmation, setDeleteConfirmation] = createSignal("");

  let fileInputRef = null;
  let faviconInputRef = null;

  createEffect(() => {
    const w = ws();
    if (w.name) setName(w.name);
    else if (!name()) setName("HyperVM");

    if (w.support_email) setSupportEmail(w.support_email);
    else if (!supportEmail()) setSupportEmail("team@hypervm.dev");

    if (w.logo) setLogoPreview(w.logo);
    if (w.favicon) setFaviconPreview(w.favicon);
    if (w.remove_branding !== undefined) setRemoveBranding(!!w.remove_branding);
  });

  const workspaceId = () => ws().id || "app_33oT1-jQnN319o4";
  const createdDate = () => ws().created_at || "September 25, 2026";

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(workspaceId());
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (e) {}
  }

  async function handleSaveName() {
    const trimmed = name().trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      if (ws().id) {
        await api("/api/ws/rename", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ wsid: ws().id, name: trimmed }),
        });
      }
      setState("ws", "name", trimmed);
      setSavedNameNotice(true);
      setTimeout(() => setSavedNameNotice(false), 2500);
      msg("Workspace renamed to " + trimmed);
    } catch (e) {
      // Local fallback if offline/mock
      setState("ws", "name", trimmed);
      setSavedNameNotice(true);
      setTimeout(() => setSavedNameNotice(false), 2500);
    } finally {
      setSavingName(false);
    }
  }

  async function handleSaveEmail() {
    const trimmed = supportEmail().trim();
    setSavingEmail(true);
    try {
      setState("ws", "support_email", trimmed);
      setSavedEmailNotice(true);
      setTimeout(() => setSavedEmailNotice(false), 2500);
      msg("Support email saved");
    } finally {
      setSavingEmail(false);
    }
  }

  function handleLogoFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setLogoPreview(dataUrl);
      try {
        if (ws().id) {
          await wsSaveLogo(dataUrl);
        } else {
          setState("ws", "logo", dataUrl);
        }
        msg("Workspace logo updated");
      } catch (err) {
        setState("ws", "logo", dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleFaviconFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setFaviconPreview(dataUrl);
      setState("ws", "favicon", dataUrl);
      msg("Favicon updated");
    };
    reader.readAsDataURL(file);
  }

  function handleToggleRemoveBranding() {
    const next = !removeBranding();
    setRemoveBranding(next);
    setState("ws", "remove_branding", next);
    msg(next ? "Whitelabel branding enabled" : "Default branding restored");
  }

  function handleTransferSubmit(e) {
    e.preventDefault();
    if (!transferEmail().trim()) return;
    msg("Ownership transfer initiated to " + transferEmail());
    setShowTransferModal(false);
    setTransferEmail("");
  }

  function handleDeleteSubmit(e) {
    e.preventDefault();
    if (deleteConfirmation().trim() !== (ws().name || "HyperVM")) {
      alert("Please enter the exact workspace name to confirm.");
      return;
    }
    msg("Workspace deletion requested");
    setShowDeleteModal(false);
    setDeleteConfirmation("");
  }

  return (
    <div class="space-y-6">
      {/* Top Header & Application Info */}
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-2 border-b border-neutral-100">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-neutral-900">
            Application settings
          </h1>
          <p class="text-xs text-neutral-500 mt-1">
            Manage workspace configuration, identity, and branding parameters.
          </p>
        </div>

        <div class="flex flex-col items-start md:items-end text-xs space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-neutral-500 font-medium">Application ID</span>
            <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 font-mono text-[11px] text-neutral-800 border border-neutral-200/60">
              <span>{workspaceId()}</span>
              <button
                type="button"
                onClick={handleCopyId}
                class="hover:text-neutral-950 transition cursor-pointer"
                title="Copy ID"
              >
                <Show
                  when={copiedId()}
                  fallback={
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  }
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </Show>
              </button>
            </div>
          </div>
          <p class="text-[11px] text-neutral-400">
            Created on <span class="text-neutral-600 font-medium">{createdDate()}</span>
          </p>
        </div>
      </div>

      {/* Card 1: Application details */}
      <div class="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        <div class="px-6 py-4 bg-neutral-50/60 border-b border-neutral-100">
          <h2 class="text-sm font-semibold text-neutral-900">Application details</h2>
        </div>

        <div class="p-6 space-y-6">
          {/* Application Name */}
          <div>
            <label class="block text-xs font-semibold text-neutral-900 mb-1">
              Application name
            </label>
            <p class="text-xs text-neutral-500 mb-2">
              Customize the name of your application. Used in the dashboard and with Clerk components.
            </p>
            <div class="flex items-center gap-3">
              <input
                type="text"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                }}
                class="w-full max-w-lg rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-black/5"
              />
              <button
                type="button"
                onClick={handleSaveName}
                disabled={savingName()}
                class="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {savingName() ? "Saving…" : "Save"}
              </button>
              <Show when={savedNameNotice()}>
                <span class="text-xs font-medium text-emerald-600 animate-fade-in">
                  Saved!
                </span>
              </Show>
            </div>
          </div>

          <div class="h-px bg-neutral-100"></div>

          {/* Support Email */}
          <div>
            <label class="block text-xs font-semibold text-neutral-900 mb-1">
              Support email
            </label>
            <p class="text-xs text-neutral-500 mb-2">
              The email displayed on Clerk components used for your application support channels.
            </p>
            <div class="flex items-center gap-3">
              <input
                type="email"
                placeholder="Enter a support email"
                value={supportEmail()}
                onInput={(e) => setSupportEmail(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEmail();
                }}
                class="w-full max-w-lg rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-black/5"
              />
              <button
                type="button"
                onClick={handleSaveEmail}
                disabled={savingEmail()}
                class="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {savingEmail() ? "Saving…" : "Save"}
              </button>
              <Show when={savedEmailNotice()}>
                <span class="text-xs font-medium text-emerald-600 animate-fade-in">
                  Saved!
                </span>
              </Show>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Branding */}
      <div class="rounded-xl border border-neutral-200 bg-white shadow-2xs overflow-hidden">
        <div class="px-6 py-4 bg-neutral-50/60 border-b border-neutral-100">
          <h2 class="text-sm font-semibold text-neutral-900">Branding</h2>
          <p class="text-xs text-neutral-500 mt-0.5">
            Configure the branding of your Clerk application.
          </p>
        </div>

        <div class="p-6 space-y-6">
          {/* Logo */}
          <div>
            <label class="block text-xs font-semibold text-neutral-900 mb-1">
              Logo
            </label>
            <p class="text-xs text-neutral-500 mb-3">
              You can upload jpeg, png, gif, or webp files.
            </p>
            <div class="flex items-center gap-4">
              <div class="h-10 w-10 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
                <Show
                  when={logoPreview()}
                  fallback={
                    <span class="text-xs font-semibold text-neutral-500">
                      {(name() || "H").slice(0, 1).toUpperCase()}
                    </span>
                  }
                >
                  <img
                    src={logoPreview()}
                    alt="Logo preview"
                    class="h-full w-full object-cover"
                  />
                </Show>
              </div>

              <input
                ref={(el) => (fileInputRef = el)}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleLogoFile}
                class="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef && fileInputRef.click()}
                class="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-800 shadow-2xs transition hover:bg-neutral-50 hover:border-neutral-300 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload image</span>
              </button>

              <Show when={logoPreview()}>
                <button
                  type="button"
                  onClick={() => {
                    setLogoPreview("");
                    setState("ws", "logo", "");
                    msg("Logo removed");
                  }}
                  class="text-xs text-neutral-500 hover:text-red-600 transition"
                >
                  Remove
                </button>
              </Show>
            </div>
          </div>

          <div class="h-px bg-neutral-100"></div>

          {/* Favicon */}
          <div>
            <label class="block text-xs font-semibold text-neutral-900 mb-1">
              Favicon
            </label>
            <p class="text-xs text-neutral-500 mb-3">
              You can upload .ico or .png files.
            </p>
            <div class="flex items-center gap-4">
              <div class="h-8 w-8 rounded-md border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
                <Show
                  when={faviconPreview()}
                  fallback={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="text-neutral-400">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  }
                >
                  <img
                    src={faviconPreview()}
                    alt="Favicon preview"
                    class="h-full w-full object-contain"
                  />
                </Show>
              </div>

              <input
                ref={(el) => (faviconInputRef = el)}
                type="file"
                accept="image/x-icon,image/png"
                onChange={handleFaviconFile}
                class="hidden"
              />

              <button
                type="button"
                onClick={() => faviconInputRef && faviconInputRef.click()}
                class="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-800 shadow-2xs transition hover:bg-neutral-50 hover:border-neutral-300 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Upload image</span>
              </button>

              <Show when={faviconPreview()}>
                <button
                  type="button"
                  onClick={() => {
                    setFaviconPreview("");
                    setState("ws", "favicon", "");
                  }}
                  class="text-xs text-neutral-500 hover:text-red-600 transition"
                >
                  Remove
                </button>
              </Show>
            </div>
          </div>

          <div class="h-px bg-neutral-100"></div>

          {/* Remove "Secured by Clerk" Branding Toggle */}
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-neutral-900">
                  Remove "Secured by Clerk" branding on Clerk Components
                </span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-white tracking-wide">
                  Pro
                </span>
              </div>
              <p class="text-xs text-neutral-500 mt-1 max-w-lg">
                This shows up by default on components like &lt;OrganizationSwitcher /&gt; and &lt;UserButton /&gt;.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={removeBranding()}
              onClick={handleToggleRemoveBranding}
              class={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                removeBranding() ? "bg-neutral-900" : "bg-neutral-200"
              }`}
            >
              <span
                class={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  removeBranding() ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Danger zone */}
      <div class="rounded-xl border border-red-200 bg-red-50/20 shadow-2xs overflow-hidden">
        <div class="px-6 py-4 bg-red-50/50 border-b border-red-100">
          <h2 class="text-sm font-semibold text-red-600">Danger zone</h2>
        </div>

        <div class="p-6 space-y-6">
          {/* Transfer ownership */}
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-xs font-semibold text-neutral-900">Transfer ownership</h3>
              <p class="text-xs text-neutral-500 mt-1 max-w-md">
                Transfer the ownership of this application to another organization.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              class="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-800 shadow-2xs transition hover:bg-neutral-50 cursor-pointer shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
              <span>Transfer ownership</span>
            </button>
          </div>

          <div class="h-px bg-red-100/70"></div>

          {/* Delete application */}
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-xs font-semibold text-neutral-900">Delete application</h3>
              <p class="text-xs text-neutral-500 mt-1 max-w-md">
                Delete this application and all associated instances and data. This action is irreversible.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-medium text-white shadow-2xs transition hover:bg-red-700 cursor-pointer shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              <span>Delete application</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transfer Ownership Modal */}
      <Show when={showTransferModal()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-fade-in"
          onClick={() => setShowTransferModal(false)}
        >
          <div
            class="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-slide-down space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 class="text-base font-semibold text-neutral-900">Transfer ownership</h3>
            <p class="text-xs text-neutral-500">
              Enter the email address of the organization member or account you wish to transfer this workspace to.
            </p>
            <form onSubmit={handleTransferSubmit} class="space-y-4">
              <input
                type="email"
                placeholder="new-owner@example.com"
                value={transferEmail()}
                onInput={(e) => setTransferEmail(e.currentTarget.value)}
                autofocus
                class="w-full rounded-lg border border-neutral-200 px-3.5 py-2 text-sm outline-none focus:border-neutral-900"
              />
              <div class="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  class="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                >
                  Send transfer invite
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      {/* Delete Application Confirmation Modal */}
      <Show when={showDeleteModal()}>
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-fade-in"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            class="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl animate-slide-down space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="flex items-center gap-2.5 text-red-600">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 class="text-base font-semibold text-neutral-900">Delete workspace?</h3>
            </div>
            <p class="text-xs text-neutral-500 leading-relaxed">
              This action cannot be undone. All active virtual machine sessions, connected accounts, and configuration data will be permanently wiped.
            </p>
            <form onSubmit={handleDeleteSubmit} class="space-y-4">
              <div>
                <label class="block text-[11px] font-medium text-neutral-600 mb-1">
                  Type <span class="font-mono font-semibold text-neutral-900">{name() || "HyperVM"}</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder={name() || "HyperVM"}
                  value={deleteConfirmation()}
                  onInput={(e) => setDeleteConfirmation(e.currentTarget.value)}
                  autofocus
                  class="w-full rounded-lg border border-red-200 px-3.5 py-2 text-sm outline-none focus:border-red-600"
                />
              </div>
              <div class="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  class="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmation().trim() !== (name() || "HyperVM")}
                  class="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Permanently delete
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  );
}
