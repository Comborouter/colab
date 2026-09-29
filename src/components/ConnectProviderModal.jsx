import { Show, For, createSignal, createEffect, onCleanup } from "solid-js";
import { connectModalOpen, connectModalProvider } from "../store.js";
import { closeConnectModal, refresh, msg } from "../actions.js";
import { api } from "../api.js";

const COLAB_PATH =
  "M16.9414 4.9757a7.033 7.033 0 0 0-4.9308 2.0646 7.033 7.033 0 0 0-.1232 9.8068l2.395-2.395a3.6455 3.6455 0 0 1 5.1497-5.1478l2.397-2.3989a7.033 7.033 0 0 0-4.8877-1.9297zM7.07 4.9855a7.033 7.033 0 0 0-4.8878 1.9316l2.3911 2.3911a3.6434 3.6434 0 0 1 5.0227.1271l1.7341-2.9737-.0997-.0802A7.033 7.033 0 0 0 7.07 4.9855zm15.0093 2.1721l-2.3892 2.3911a3.6455 3.6455 0 0 1-5.1497 5.1497l-2.4067 2.4068a7.0362 7.0362 0 0 0 9.9456-9.9476zM1.932 7.1674a7.033 7.033 0 0 0-.002 9.6816l2.397-2.397a3.6434 3.6434 0 0 1-.004-4.8916zm7.664 7.4235c-1.38 1.3816-3.5863 1.411-5.0168.1134l-2.397 2.395c2.4693 2.3328 6.263 2.5753 9.0072.5455l.1368-.1115z";

const PROVIDERS = [
  {
    id: "colab",
    name: "Google Colab",
    desc: "Google-managed CPU & GPU runtimes",
    badge: "Available",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "runpod",
    name: "RunPod",
    desc: "GPU cloud (Coming soon)",
    badge: "Soon",
    badgeColor: "bg-neutral-100 text-neutral-600 border-neutral-200",
    iconChar: "⚡",
  },
  {
    id: "lambda",
    name: "Lambda Labs",
    desc: "On-demand cloud GPUs (Coming soon)",
    badge: "Soon",
    badgeColor: "bg-neutral-100 text-neutral-600 border-neutral-200",
    iconChar: "🚀",
  },
];

export default function ConnectProviderModal() {
  const [selectedProvider, setSelectedProvider] = createSignal("colab");
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [token, setToken] = createSignal("");
  const [authUrl, setAuthUrl] = createSignal("");
  const [loadingUrl, setLoadingUrl] = createSignal(false);
  const [urlError, setUrlError] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [submitError, setSubmitError] = createSignal("");
  const [connected, setConnected] = createSignal(false);
  const [copiedLink, setCopiedLink] = createSignal(false);

  let tokenInputRef = null;
  let closeTimeout = null;

  async function fetchAuthUrl() {
    setLoadingUrl(true);
    setUrlError("");
    try {
      const res = await api("/api/connect-url");
      if (res && res.url) {
        setAuthUrl(res.url);
      } else {
        setUrlError("No URL returned from server");
      }
    } catch (e) {
      setUrlError(String(e.message || e));
    } finally {
      setLoadingUrl(false);
    }
  }

  function handleOpenConnector() {
    if (authUrl()) {
      window.open(authUrl(), "_blank");
      if (tokenInputRef) tokenInputRef.focus();
    } else {
      fetchAuthUrl().then(() => {
        if (authUrl()) window.open(authUrl(), "_blank");
      });
    }
  }

  async function handleCopyUrl() {
    if (!authUrl()) return;
    try {
      await navigator.clipboard.writeText(authUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {}
  }

  async function handlePasteToken() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setToken(text.trim());
        if (tokenInputRef) tokenInputRef.focus();
      }
    } catch (e) {}
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (selectedProvider() !== "colab") return;

    const trimmed = token().trim();
    if (!trimmed) {
      setSubmitError("Please enter the authorization token.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      await api("/api/connect-submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      setConnected(true);
      msg("Google Colab connected successfully");
      await refresh();

      closeTimeout = setTimeout(() => {
        handleClose();
      }, 1600);
    } catch (err) {
      setSubmitError(String(err.message || err || "Authorization failed"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (closeTimeout) clearTimeout(closeTimeout);
    setToken("");
    setSubmitError("");
    setUrlError("");
    setConnected(false);
    setDropdownOpen(false);
    closeConnectModal();
  }

  createEffect(() => {
    if (connectModalOpen()) {
      setSelectedProvider(connectModalProvider() || "colab");
      setSubmitError("");
      setConnected(false);
      setToken("");
      fetchAuthUrl();
      setTimeout(() => {
        if (tokenInputRef) tokenInputRef.focus();
      }, 100);
    }
  });

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && connectModalOpen()) {
      handleClose();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown);
      if (closeTimeout) clearTimeout(closeTimeout);
    });
  }

  const curProvider = () =>
    PROVIDERS.find((p) => p.id === selectedProvider()) || PROVIDERS[0];

  return (
    <Show when={connectModalOpen()}>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div
          class="w-full max-w-[520px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl animate-slide-down flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div class="flex items-start justify-between border-b border-neutral-100 px-6 py-5">
            <div>
              <h2 class="text-[17px] font-semibold tracking-[-0.02em] text-neutral-900">
                Add provider
              </h2>
              <p class="mt-1 text-xs text-neutral-500">
                Connect a compute provider to run keepalive sessions and apps.
              </p>
            </div>
            <button
              onClick={handleClose}
              class="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div class="px-6 py-5 overflow-y-auto space-y-5">
            {/* Provider Selector */}
            <div>
              <label class="mb-2 block text-xs font-medium text-neutral-700">
                Provider
              </label>
              <div class="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen())}
                  class="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-left shadow-xs transition hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50/70 border border-amber-200/60">
                      <Show
                        when={curProvider().id === "colab"}
                        fallback={
                          <span class="text-base">{curProvider().iconChar || "☁"}</span>
                        }
                      >
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="#F9AB00">
                          <path d={COLAB_PATH} />
                        </svg>
                      </Show>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-neutral-900 flex items-center gap-2">
                        {curProvider().name}
                        <span
                          class={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${curProvider().badgeColor}`}
                        >
                          {curProvider().badge}
                        </span>
                      </div>
                      <div class="text-xs text-neutral-400">
                        {curProvider().desc}
                      </div>
                    </div>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    class={`text-neutral-400 transition-transform ${dropdownOpen() ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>

                {/* Dropdown Options */}
                <Show when={dropdownOpen()}>
                  <div class="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl animate-fade-in">
                    <For each={PROVIDERS}>
                      {(p) => (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProvider(p.id);
                            setDropdownOpen(false);
                            if (p.id === "colab" && !authUrl()) fetchAuthUrl();
                          }}
                          class={`flex w-full items-center justify-between rounded-lg p-2.5 text-left transition hover:bg-neutral-50 ${
                            selectedProvider() === p.id ? "bg-neutral-50 font-medium" : ""
                          }`}
                        >
                          <div class="flex items-center gap-3">
                            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                              <Show
                                when={p.id === "colab"}
                                fallback={
                                  <span class="text-sm">{p.iconChar || "☁"}</span>
                                }
                              >
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="#F9AB00">
                                  <path d={COLAB_PATH} />
                                </svg>
                              </Show>
                            </div>
                            <div>
                              <div class="text-sm text-neutral-900">{p.name}</div>
                              <div class="text-[11px] text-neutral-400">{p.desc}</div>
                            </div>
                          </div>
                          <span
                            class={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${p.badgeColor}`}
                          >
                            {p.badge}
                          </span>
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            </div>

            {/* Google Colab Flow */}
            <Show when={selectedProvider() === "colab"}>
              <div class="space-y-4">
                <div class="h-px bg-neutral-100"></div>

                {/* Step 1 */}
                <div class="flex gap-3.5">
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white">
                    1
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-neutral-900">
                      Open the Colab connector
                    </div>
                    <p class="mt-1 text-xs leading-5 text-neutral-500">
                      Open the Google Colab authorization link to grant access and obtain your connection token.
                    </p>

                    <div class="mt-3 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleOpenConnector}
                        disabled={loadingUrl()}
                        class="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-800 shadow-2xs transition hover:bg-neutral-50 hover:border-neutral-400 disabled:opacity-60 cursor-pointer"
                      >
                        <Show
                          when={!loadingUrl()}
                          fallback={
                            <>
                              <span class="spin"></span>
                              <span>Fetching authorization link…</span>
                            </>
                          }
                        >
                          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#F9AB00">
                            <path d={COLAB_PATH} />
                          </svg>
                          <span>Open Google Colab Authorization</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M14 5H19V10M19 5L10 14"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M19 13V18C19 19.1 18.1 20 17 20H6C4.9 20 4 19.1 4 18V7C4 5.9 4.9 5 6 5H11"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                            />
                          </svg>
                        </Show>
                      </button>

                      <Show when={authUrl()}>
                        <button
                          type="button"
                          onClick={handleCopyUrl}
                          class="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer"
                          title="Copy authorization URL to clipboard"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          <span>{copiedLink() ? "Copied!" : "Copy link"}</span>
                        </button>
                      </Show>
                    </div>

                    <Show when={urlError()}>
                      <p class="mt-2 text-xs text-red-600 flex items-center gap-1.5">
                        <span>Failed to fetch auth URL: {urlError()}</span>
                        <button
                          type="button"
                          onClick={fetchAuthUrl}
                          class="underline hover:text-red-800"
                        >
                          Retry
                        </button>
                      </p>
                    </Show>
                  </div>
                </div>

                {/* Vertical connector line */}
                <div class="ml-[13px] h-4 w-px bg-neutral-200"></div>

                {/* Step 2 */}
                <div class="flex gap-3.5">
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-semibold text-white">
                    2
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-neutral-900">
                      Paste your connection token
                    </div>
                    <p class="mt-1 text-xs leading-5 text-neutral-500">
                      Enter or paste the token string returned by Google Colab after completing sign-in.
                    </p>

                    {/* Token Box */}
                    <div class="mt-3 relative">
                      <input
                        ref={(el) => (tokenInputRef = el)}
                        type="text"
                        value={token()}
                        onInput={(e) => {
                          setToken(e.currentTarget.value);
                          setSubmitError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSubmit(e);
                        }}
                        placeholder="e.g. 4/0AeaYSH..."
                        class="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-3.5 py-2.5 pr-20 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-black/5"
                        autocomplete="off"
                        spellcheck="false"
                      />
                      <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Show when={token()}>
                          <button
                            type="button"
                            onClick={() => {
                              setToken("");
                              if (tokenInputRef) tokenInputRef.focus();
                            }}
                            class="p-1 text-neutral-400 hover:text-neutral-700 rounded cursor-pointer"
                            title="Clear"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </Show>
                        <button
                          type="button"
                          onClick={handlePasteToken}
                          class="px-2 py-1 text-[11px] font-medium text-neutral-600 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md transition shadow-2xs cursor-pointer"
                          title="Paste from clipboard"
                        >
                          Paste
                        </button>
                      </div>
                    </div>

                    <Show when={submitError()}>
                      <p class="mt-2 text-xs text-red-600 flex items-center gap-1.5 animate-fade-in">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{submitError()}</span>
                      </p>
                    </Show>
                  </div>
                </div>

                {/* Connected Banner State */}
                <Show when={connected()}>
                  <div class="animate-fade-in rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
                    <div class="flex items-start gap-3">
                      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 12.5L9.5 17L19 7"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-emerald-900">
                          Google Colab connected
                        </div>
                        <div class="mt-0.5 text-xs text-emerald-700">
                          Your profile is active and ready to create and keep sessions alive.
                        </div>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
            </Show>

            {/* Other Provider Placeholders (RunPod, Lambda) */}
            <Show when={selectedProvider() !== "colab"}>
              <div class="rounded-xl border border-neutral-200 bg-neutral-50 p-5 animate-fade-in text-center space-y-2">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xs mx-auto text-xl border border-neutral-200">
                  {curProvider().iconChar || "⚡"}
                </div>
                <div class="text-sm font-semibold text-neutral-900">
                  {curProvider().name} Integration
                </div>
                <p class="text-xs text-neutral-500 max-w-sm mx-auto">
                  API key authentication and cloud worker provisioning for {curProvider().name} are in active development.
                </p>
                <div class="pt-2">
                  <span class="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
            </Show>
          </div>

          {/* Footer */}
          <div class="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/70 px-6 py-4">
            <div class="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3L20 7V11C20 16.5 16.4 20.1 12 21C7.6 20.1 4 16.5 4 11V7L12 3Z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                />
                <path
                  d="M9 12L11 14L15 10"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Your credentials stay private</span>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                class="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  selectedProvider() !== "colab" ||
                  !token().trim() ||
                  submitting() ||
                  connected()
                }
                class={`rounded-lg px-4 py-2 text-xs font-medium text-white shadow-xs transition flex items-center gap-2 ${
                  connected()
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-black hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                }`}
              >
                <Show when={submitting()}>
                  <span class="h-3 w-3 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"></span>
                  <span>Connecting…</span>
                </Show>
                <Show when={connected()}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5L9.5 17L19 7"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span>Connected</span>
                </Show>
                <Show when={!submitting() && !connected()}>
                  <span>Connect provider</span>
                </Show>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
