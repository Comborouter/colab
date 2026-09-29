import { For, Show, createSignal, createMemo } from "solid-js";
import { state, codeOpen, refs, setProfileOpen, setRoute, setDashTab, configSubTab, setConfigSubTab } from "../store.js";
import { startConnect, submitCode, openConnectModal } from "../actions.js";
import WorkspaceSettings from "./WorkspaceSettings.jsx";
import TeamTab from "./TeamTab.jsx";

const COLAB_PATH =
  "M16.9414 4.9757a7.033 7.033 0 0 0-4.9308 2.0646 7.033 7.033 0 0 0-.1232 9.8068l2.395-2.395a3.6455 3.6455 0 0 1 5.1497-5.1478l2.397-2.3989a7.033 7.033 0 0 0-4.8877-1.9297zM7.07 4.9855a7.033 7.033 0 0 0-4.8878 1.9316l2.3911 2.3911a3.6434 3.6434 0 0 1 5.0227.1271l1.7341-2.9737-.0997-.0802A7.033 7.033 0 0 0 7.07 4.9855zm15.0093 2.1721l-2.3892 2.3911a3.6455 3.6455 0 0 1-5.1497 5.1497l-2.4067 2.4068a7.0362 7.0362 0 0 0 9.9456-9.9476zM1.932 7.1674a7.033 7.033 0 0 0-.002 9.6816l2.397-2.397a3.6434 3.6434 0 0 1-.004-4.8916zm7.664 7.4235c-1.38 1.3816-3.5863 1.411-5.0168.1134l-2.397 2.395c2.4693 2.3328 6.263 2.5753 9.0072.5455l.1368-.1115z";

const PROVIDER_TYPES = [{ id: "colab", name: "Google Colab", desc: "OAuth2 · Cloud" }];

function ColabMark() {
  return (
    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="#F9AB00" aria-hidden="true">
      <path d={COLAB_PATH} />
    </svg>
  );
}

export default function ConfigureTab() {
  const subTab = configSubTab;
  const setSubTab = setConfigSubTab;
  const [query, setQuery] = createSignal("");
  const [locTab, setLocTab] = createSignal("all");
  const [addOpen, setAddOpen] = createSignal(false);
  const rows = createMemo(function () {
    const q = query().trim().toLowerCase();
    return (state.profiles || [])
      .filter(function (p) {
        if (locTab() === "local") return false;
        if (!q) return true;
        return (
          "google colab".includes(q) || String(p.email || "").toLowerCase().includes(q)
        );
      })
      .map(function (p) {
        return {
          name: "Google Colab",
          email: p.email || "",
          expired: !!(p.expiry && p.expiry < Date.now()),
        };
      });
  });
  const connectType = (id) => {
    setAddOpen(false);
    openConnectModal(id || "colab");
  };
  return (
    <div class="flex gap-6">
      <aside class="w-64 shrink-0">
        <div class="border border-neutral-200 rounded-xl p-4 bg-white">
          <div class="relative">
            <input
              type="text"
              placeholder="Find..."
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              class="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
            />
            <span class="absolute right-3 top-2.5 text-xs text-neutral-400">CTRL K</span>
          </div>
          <nav class="mt-4 space-y-6">
            <div>
              <h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Configure
              </h3>

              {/* Workspace */}
              <div class="mb-3">
                <button
                  type="button"
                  onClick={() => setSubTab("settings")}
                  class={"flex items-center gap-2 mb-1.5 w-full text-left transition " +
                    (subTab() === "settings"
                      ? "text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:text-neutral-900 font-medium")
                  }
                >
                  <svg
                    class="w-4 h-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span class="text-sm">Workspace</span>
                </button>
                <div class="ml-6 space-y-1">
                  <button
                    type="button"
                    onClick={() => setSubTab("settings")}
                    class={"flex items-center gap-2 w-full text-left py-1 text-sm rounded-md transition cursor-pointer " +
                      (subTab() === "settings"
                        ? "font-medium text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900")
                    }
                  >
                    <Show when={subTab() === "settings"}>
                      <div class="w-1 h-3.5 bg-neutral-900 rounded-full"></div>
                    </Show>
                    <span>Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTab("team")}
                    class={"flex items-center gap-2 w-full text-left py-1 text-sm rounded-md transition cursor-pointer " +
                      (subTab() === "team"
                        ? "font-medium text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900")
                    }
                  >
                    <Show when={subTab() === "team"}>
                      <div class="w-1 h-3.5 bg-neutral-900 rounded-full"></div>
                    </Show>
                    <span>Team</span>
                  </button>
                </div>
              </div>

              {/* Compute (replacing Web3) */}
              <div class="mb-3">
                <button
                  type="button"
                  onClick={() => setSubTab("providers")}
                  class={"flex items-center gap-2 mb-1.5 w-full text-left transition " +
                    (subTab() === "providers"
                      ? "text-neutral-900 font-semibold"
                      : "text-neutral-600 hover:text-neutral-900 font-medium")
                  }
                >
                  <svg
                    class="w-4 h-4 text-neutral-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                    />
                  </svg>
                  <span class="text-sm">Compute</span>
                </button>
                <div class="ml-6 space-y-1">
                  <button
                    type="button"
                    onClick={() => setSubTab("providers")}
                    class={"flex items-center gap-2 w-full text-left py-1 text-sm rounded-md transition cursor-pointer " +
                      (subTab() === "providers"
                        ? "font-medium text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900")
                    }
                  >
                    <Show when={subTab() === "providers"}>
                      <div class="w-1 h-3.5 bg-neutral-900 rounded-full"></div>
                    </Show>
                    <span>Providers</span>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Sessions
              </h3>
              <button
                class="text-sm text-neutral-600 hover:text-neutral-900 transition"
                onClick={() => setDashTab("overview")}
              >
                Virtual machines
              </button>
            </div>
            <div>
              <h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Billing
              </h3>
            </div>
            <div>
              <h3 class="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                Customization
              </h3>
              <button
                class="flex items-center gap-2 mb-2 text-neutral-600 hover:text-neutral-900 transition w-full text-left"
                onClick={() => setSubTab("settings")}
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span class="text-sm">Avatars</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>
      <main class="flex-1 min-w-0">
        <Show when={subTab() === "settings"}>
          <WorkspaceSettings />
        </Show>

        <Show when={subTab() === "team"}>
          <TeamTab />
        </Show>

        <Show when={subTab() === "providers"}>
          <Show when={codeOpen()}>
            <div class="flex items-center gap-2 mb-4 border border-neutral-200 rounded-lg px-4 py-3 bg-white">
              <input
                type="text"
                placeholder="paste authorization code"
                class="inp flex-1"
                ref={(el) => (refs.codeInput = el)}
              />
              <button class="btn btn-xs btn-p" onClick={(e) => submitCode(e.currentTarget)}>
                authorize
              </button>
            </div>
          </Show>
          <div class="flex justify-between items-center mb-7">
            <h1 class="text-[28px] font-bold tracking-tight">Providers</h1>
            <button
              class="bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-xs cursor-pointer"
              onClick={() => openConnectModal("colab")}
            >
              <span>+ Add provider</span>
            </button>
          </div>
          <div class="flex gap-6 mb-6 border-b border-neutral-200">
            {["all", "local", "cloud"].map(function (k) {
              const label = k.slice(0, 1).toUpperCase() + k.slice(1);
              return (
                <button
                  onClick={() => setLocTab(k)}
                  class={
                    "pb-3 text-sm font-medium transition " +
                    (locTab() === k
                      ? "border-b-2 border-purple-600 text-purple-600"
                      : "text-neutral-500 hover:text-neutral-700")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div class="mb-6">
            <input
              type="text"
              placeholder="Search..."
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
              class="w-full max-w-sm px-4 py-2 border border-neutral-300 rounded-md text-sm"
            />
          </div>
          <div class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <div class="grid grid-cols-2 gap-4 px-6 py-4 border-b border-neutral-100 bg-neutral-50">
              <span class="text-sm font-medium text-neutral-500">Provider</span>
              <span class="text-sm font-medium text-neutral-500">Configuration</span>
            </div>
            <Show
              when={rows().length}
              fallback={
                <div class="hint px-6 py-4">
                  {locTab() === "local"
                    ? "No local providers yet."
                    : "No providers match."}
                </div>
              }
            >
              <For each={rows()}>
                {(r) => (
                  <div class="grid grid-cols-2 gap-4 px-6 py-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-white rounded-lg border border-neutral-200 flex items-center justify-center">
                        <ColabMark />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-neutral-900">{r.name}</p>
                        <p class="text-xs text-neutral-500">
                          {r.email}
                          {r.expired ? " · token expired" : ""}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Oauth2
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
          <div class="mt-4 flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-md">
            <svg
              class="w-5 h-5 text-blue-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm text-blue-800">
              Provider tokens refresh automatically; reconnect an account if its token expires.
            </p>
          </div>
        </Show>
      </main>
    </div>
  );
}
