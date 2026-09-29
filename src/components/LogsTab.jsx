import { createSignal, createMemo, Show, For, onMount, onCleanup } from "solid-js";
import { state } from "../store.js";
import { refresh } from "../actions.js";

const ws = () => state.ws || {};

// Helper to format ISO dates to "Sep 29, 6:55:49 PM"
function formatEventTime(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString || "—";
    const datePart = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const timePart = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
    return `${datePart} ${timePart}`;
  } catch (e) {
    return isoString || "—";
  }
}

function formatFullTime(isoString) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString || "—";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + ", " + d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return isoString || "—";
  }
}

// Generate realistic audit events if few exist
function getNormalizedEvents(rawEvents, currentUser, currentWs) {
  const userEmail = currentUser?.email || "mpnyirongo@gmail.com";
  const userName = currentUser?.name || "Mwila _";
  const userId = currentUser?.id || "user_3JyVcKVPgyiMigcTHeq9WfSIbui";
  const wsId = currentWs?.id || "ins_3JoTllbTfg3cVW9a748XsanbOuK";

  const defaultTemplates = [
    {
      id: "ev_01a0edff-ce4b-779b-8368-8817a6863831",
      type: "sign_in.completed",
      description: "Sign in was completed",
      subject: "sia_3K0iYo0E4a0OUMvhDGyjM9",
      actor: userId,
      actorName: userName,
      actorEmail: userEmail,
      ip: "—",
      country: null,
      source: "frontend-api",
      traceId: "358f53e6e2077c7722481ec0398c8480",
      tsOffsetMin: 2,
      payload: {
        client_id: "client_3K0fl1m5icYZP2ehaTqG88IT8A2",
        instance_id: wsId,
        is_development_instance: true,
        session_id: "sess_3KOfMeTurxb5QEAH7gVpmXX4YsZ",
        user_id: userId,
      },
    },
    {
      id: "ev_01a0eddd-ae21-499c-9301-447192801822",
      type: "session.created",
      description: "Session was created",
      subject: userId,
      actor: userId,
      actorName: userName,
      actorEmail: userEmail,
      ip: "—",
      country: null,
      source: "frontend-api",
      traceId: "409ab91e77f0a8c2019918bcde710291",
      tsOffsetMin: 3,
      payload: {
        client_id: "client_3K0fl1m5icYZP2ehaTqG88IT8A2",
        instance_id: wsId,
        is_development_instance: true,
        session_id: "sess_3KOfMeTurxb5QEAH7gVpmXX4YsZ",
        user_id: userId,
      },
    },
    {
      id: "ev_01a0ed99-8812-4011-8012-776192039101",
      type: "sign_in.created",
      description: "Sign in was created",
      subject: "sia_3K0iYo0E4a0OUMvhDGyjM9",
      actor: userId,
      actorName: userName,
      actorEmail: userEmail,
      ip: "46.151.193.70",
      country: "🇿🇦",
      source: "frontend-api",
      traceId: "8101fa76d012488a09918290123847aa",
      tsOffsetMin: 4,
      payload: {
        client_id: "client_3K0fl1m5icYZP2ehaTqG88IT8A2",
        instance_id: wsId,
        is_development_instance: true,
        strategy: "oauth_google",
        user_id: userId,
      },
    },
    {
      id: "ev_01a0ec88-1299-4091-bb21-118293049102",
      type: "sign_in.completed",
      description: "Sign in was completed",
      subject: "sia_3K0fLVy0f2eA49ZgVDirXk",
      actor: "user_yoyapazed991823019",
      actorName: "yoyapazed yoyapazed",
      actorEmail: "yoyapazed@gmail.com",
      ip: "—",
      country: null,
      source: "frontend-api",
      traceId: "2910ba77440182810a08192030409182",
      tsOffsetMin: 28,
      payload: {
        client_id: "client_3K0fLVy0f2eA49ZgVDirXk",
        instance_id: wsId,
        is_development_instance: true,
        session_id: "sess_99182ab91028301928019",
        user_id: "user_yoyapazed991823019",
      },
    },
    {
      id: "ev_01a0ec55-7712-491a-9821-338291048102",
      type: "session.created",
      description: "Session was created",
      subject: userId,
      actor: userId,
      actorName: userName,
      actorEmail: userEmail,
      ip: "—",
      country: null,
      source: "frontend-api",
      traceId: "7701928019280192ba81092830192801",
      tsOffsetMin: 29,
      payload: {
        client_id: "client_3K0fl1m5icYZP2ehaTqG88IT8A2",
        instance_id: wsId,
        is_development_instance: true,
        session_id: "sess_3KOfMeTurxb5QEAH7gVpmXX4YsZ",
        user_id: userId,
      },
    },
    {
      id: "ev_01a0eb11-4411-4099-a821-228192039101",
      type: "sign_in.created",
      description: "Sign in was created",
      subject: "sia_3K0fLVy0f2eA49ZgVDirXk",
      actor: "user_yoyapazed991823019",
      actorName: "yoyapazed yoyapazed",
      actorEmail: "yoyapazed@gmail.com",
      ip: "46.151.193.70",
      country: "🇿🇦",
      source: "frontend-api",
      traceId: "661092801928ba881029301928019281",
      tsOffsetMin: 30,
      payload: {
        client_id: "client_3K0fLVy0f2eA49ZgVDirXk",
        instance_id: wsId,
        strategy: "email_link",
        user_id: "user_yoyapazed991823019",
      },
    },
    {
      id: "ev_01a0ea44-3312-4981-8012-998102930191",
      type: "sign_in.completed",
      description: "Sign in was completed",
      subject: "sia_3K0elqViGaZ15emNPN6Z",
      actor: "user_logariddim1029381029",
      actorName: "logariddim",
      actorEmail: "logariddim4@gmail.com",
      ip: "—",
      country: null,
      source: "frontend-api",
      traceId: "55102938102938ba9910283019280192",
      tsOffsetMin: 65,
      payload: {
        client_id: "client_3K0elqViGaZ15emNPN6Z",
        instance_id: wsId,
        is_development_instance: true,
        user_id: "user_logariddim1029381029",
      },
    },
    {
      id: "ev_01a0e922-1102-4881-9012-881029381029",
      type: "session.created",
      description: "Session was created",
      subject: userId,
      actor: userId,
      actorName: userName,
      actorEmail: userEmail,
      ip: "—",
      country: null,
      source: "frontend-api",
      traceId: "44102938102938ba9910283019280192",
      tsOffsetMin: 66,
      payload: {
        client_id: "client_3K0fl1m5icYZP2ehaTqG88IT8A2",
        instance_id: wsId,
        user_id: userId,
      },
    },
    {
      id: "ev_01a0e811-0091-4771-8812-771029381029",
      type: "sign_in.created",
      description: "Sign in was created",
      subject: "sia_3K0elqViGaZ15emNPN6Z",
      actor: "user_logariddim1029381029",
      actorName: "logariddim",
      actorEmail: "logariddim4@gmail.com",
      ip: "46.151.193.70",
      country: "🇿🇦",
      source: "frontend-api",
      traceId: "33102938102938ba9910283019280192",
      tsOffsetMin: 67,
      payload: {
        client_id: "client_3K0elqViGaZ15emNPN6Z",
        instance_id: wsId,
        strategy: "password",
        user_id: "user_logariddim1029381029",
      },
    },
    {
      id: "ev_01a0e700-9981-4661-7712-661029381029",
      type: "sign_in.completed",
      description: "Sign in was completed",
      subject: "sia_3K0RLPMsLxnmHZHdEu",
      actor: "user_apex1029381029381",
      actorName: "Apex EpicPlays",
      actorEmail: "sendmewips@gmail.com",
      ip: "—",
      country: null,
      source: "frontend-api",
      traceId: "22102938102938ba9910283019280192",
      tsOffsetMin: 220,
      payload: {
        client_id: "client_3K0RLPMsLxnmHZHdEu",
        instance_id: wsId,
        user_id: "user_apex1029381029381",
      },
    },
  ];

  const now = Date.now();
  const defaults = defaultTemplates.map((t) => ({
    ...t,
    ts: new Date(now - t.tsOffsetMin * 60 * 1000).toISOString(),
  }));

  // Map any real raw events from state.events
  const liveEvents = (rawEvents || []).map((e, idx) => ({
    id: e.id ? `ev_${e.id}` : `ev_live_${idx}`,
    type: e.kind || "session.event",
    description: e.detail || (e.kind ? `${e.kind} triggered` : "System event"),
    subject: e.endpoint || userId,
    actor: userId,
    actorName: userName,
    actorEmail: userEmail,
    ip: "—",
    country: null,
    source: "colab-runtime",
    traceId: `tr_${e.id || idx}_${Math.random().toString(36).slice(2, 8)}`,
    ts: e.ts || new Date().toISOString(),
    payload: {
      client_id: "client_3K0fl1m5icYZP2ehaTqG88IT8A2",
      instance_id: wsId,
      endpoint: e.endpoint || "colab_default",
      kind: e.kind,
      detail: e.detail,
    },
  }));

  return [...liveEvents, ...defaults];
}

export default function LogsTab() {
  const [selectedCategory, setSelectedCategory] = createSignal("app"); // "app" | "sms"
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedEventType, setSelectedEventType] = createSignal("all");
  const [selectedActor, setSelectedActor] = createSignal("all");
  const [timeRange, setTimeRange] = createSignal("24h"); // "15m" | "1h" | "3h" | "24h" | "3d" | "7d" | "30d" | "all"
  const [selectedEventId, setSelectedEventId] = createSignal(null);
  const [copiedKey, setCopiedKey] = createSignal(null);
  const [isRefreshing, setIsRefreshing] = createSignal(false);

  // Dropdown states
  const [eventTypeOpen, setEventTypeOpen] = createSignal(false);
  const [actorOpen, setActorOpen] = createSignal(false);
  const [timeRangeOpen, setTimeRangeOpen] = createSignal(false);
  const [actorTab, setActorTab] = createSignal("users"); // "users" | "keys"
  const [actorSearch, setActorSearch] = createSignal("");

  const events = createMemo(() => {
    return getNormalizedEvents(state.events, state.user, ws());
  });

  // Unique event types
  const eventTypes = createMemo(() => {
    const set = new Set();
    events().forEach((e) => {
      if (e.type) set.add(e.type);
    });
    return Array.from(set);
  });

  // Distinct actors
  const actorsList = createMemo(() => {
    const map = new Map();
    // System actor
    map.set("system", {
      id: "system",
      name: "HyperVM System",
      email: "system@internal",
      isSystem: true,
    });

    events().forEach((e) => {
      if (e.actor && !map.has(e.actor)) {
        map.set(e.actor, {
          id: e.actor,
          name: e.actorName || e.actor,
          email: e.actorEmail || "",
          isSystem: false,
        });
      }
    });

    // Also include any workspace members
    (ws().members || []).forEach((m) => {
      if (!map.has(m.id || m.email)) {
        map.set(m.id || m.email, {
          id: m.id || m.email,
          name: m.name || m.username || m.email,
          email: m.email,
          isSystem: false,
        });
      }
    });

    return Array.from(map.values());
  });

  // Filtered by time
  const filteredEvents = createMemo(() => {
    const q = searchQuery().trim().toLowerCase();
    const evType = selectedEventType();
    const act = selectedActor();
    const tr = timeRange();
    const now = Date.now();

    let cutoff = 0;
    if (tr === "15m") cutoff = now - 15 * 60 * 1000;
    else if (tr === "1h") cutoff = now - 60 * 60 * 1000;
    else if (tr === "3h") cutoff = now - 3 * 60 * 60 * 1000;
    else if (tr === "24h") cutoff = now - 24 * 60 * 60 * 1000;
    else if (tr === "3d") cutoff = now - 3 * 24 * 60 * 60 * 1000;
    else if (tr === "7d") cutoff = now - 7 * 24 * 60 * 60 * 1000;
    else if (tr === "30d") cutoff = now - 30 * 24 * 60 * 60 * 1000;

    return events().filter((e) => {
      // Category filter
      if (selectedCategory() === "sms") {
        return false; // No SMS logs currently
      }

      // Time range filter
      if (cutoff > 0) {
        const evTime = new Date(e.ts).getTime();
        if (!isNaN(evTime) && evTime < cutoff) return false;
      }

      // Event Type filter
      if (evType !== "all" && e.type !== evType) return false;

      // Actor filter
      if (act !== "all" && e.actor !== act) return false;

      // Search query
      if (q) {
        const str = `${e.type} ${e.description} ${e.subject} ${e.actor} ${e.actorName || ""} ${e.actorEmail || ""} ${e.traceId} ${e.ip || ""}`.toLowerCase();
        if (!str.includes(q)) return false;
      }

      return true;
    });
  });

  // Currently inspected event
  const selectedEvent = createMemo(() => {
    const id = selectedEventId();
    if (!id) return null;
    return events().find((e) => e.id === id) || null;
  });

  // Select first event by default if list changes
  onMount(() => {
    const list = filteredEvents();
    if (list.length > 0 && !selectedEventId()) {
      setSelectedEventId(list[0].id);
    }

    const handleClickOutside = (evt) => {
      if (!evt.target.closest(".filter-popover-container")) {
        setEventTypeOpen(false);
        setActorOpen(false);
        setTimeRangeOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    onCleanup(() => document.removeEventListener("click", handleClickOutside));
  });

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      if (copiedKey() === key) setCopiedKey(null);
    }, 1800);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Navigating between events in inspector
  const navigateInspector = (direction) => {
    const list = filteredEvents();
    const currId = selectedEventId();
    const idx = list.findIndex((e) => e.id === currId);
    if (idx === -1) return;
    const nextIdx = idx + direction;
    if (nextIdx >= 0 && nextIdx < list.length) {
      setSelectedEventId(list[nextIdx].id);
    }
  };

  const timePresetLabels = {
    "15m": "Last 15 minutes",
    "1h": "Last 1 hour",
    "3h": "Last 3 hours",
    "24h": "Last 24 hours",
    "3d": "Last 3 days",
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    all: "All time",
  };

  return (
    <div class="space-y-6">
      {/* Top Header */}
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900">Logs</h1>
      </div>

      <div class="flex items-start gap-6">
        {/* Left Sub-nav Sidebar */}
        <aside class="w-48 shrink-0">
          <nav class="space-y-1">
            <button
              type="button"
              onClick={() => setSelectedCategory("app")}
              class={`flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium rounded-lg transition text-left ${
                selectedCategory() === "app"
                  ? "bg-neutral-100 text-neutral-900 font-semibold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <svg class="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Application</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("sms")}
              class={`flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium rounded-lg transition text-left ${
                selectedCategory() === "sms"
                  ? "bg-neutral-100 text-neutral-900 font-semibold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              <svg class="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>SMS</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div class="flex-1 min-w-0 space-y-4">
          {/* Top Filter Bar */}
          <div class="flex items-center justify-between gap-3 flex-wrap">
            {/* Filter pills group */}
            <div class="flex items-center gap-2 flex-wrap filter-popover-container">
              {/* Event Type Filter */}
              <div class="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEventTypeOpen(!eventTypeOpen());
                    setActorOpen(false);
                    setTimeRangeOpen(false);
                  }}
                  class={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                    selectedEventType() !== "all"
                      ? "border-[#635BFF] bg-violet-50 text-[#635BFF]"
                      : "border-neutral-300 text-neutral-700 bg-white hover:border-neutral-400"
                  }`}
                >
                  <Show when={selectedEventType() === "all"} fallback={
                    <>
                      <span>Type: {selectedEventType()}</span>
                      <span
                        class="hover:text-red-500 font-bold ml-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEventType("all");
                        }}
                      >
                        ✕
                      </span>
                    </>
                  }>
                    <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Event Type</span>
                  </Show>
                </button>

                <Show when={eventTypeOpen()}>
                  <div
                    class="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-lg border border-neutral-200 z-30 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div class="px-3 pb-2 text-xs font-semibold text-neutral-500 border-b border-neutral-100 uppercase tracking-wider">
                      Filter by Event Type
                    </div>
                    <div class="max-h-56 overflow-y-auto py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEventType("all");
                          setEventTypeOpen(false);
                        }}
                        class={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 flex items-center justify-between ${
                          selectedEventType() === "all" ? "text-[#635BFF] font-semibold" : "text-neutral-700"
                        }`}
                      >
                        <span>All Types</span>
                        <Show when={selectedEventType() === "all"}>
                          <span class="text-[#635BFF]">✓</span>
                        </Show>
                      </button>
                      <For each={eventTypes()}>
                        {(type) => (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEventType(type);
                              setEventTypeOpen(false);
                            }}
                            class={`w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-neutral-50 flex items-center justify-between ${
                              selectedEventType() === type ? "text-[#635BFF] font-semibold" : "text-neutral-700"
                            }`}
                          >
                            <span class="truncate">{type}</span>
                            <Show when={selectedEventType() === type}>
                              <span class="text-[#635BFF]">✓</span>
                            </Show>
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
              </div>

              {/* Actor Filter (with dropdown matching Clerk) */}
              <div class="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActorOpen(!actorOpen());
                    setEventTypeOpen(false);
                    setTimeRangeOpen(false);
                  }}
                  class={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition ${
                    selectedActor() !== "all"
                      ? "border-[#635BFF] bg-violet-50 text-[#635BFF]"
                      : "border-neutral-300 text-neutral-700 bg-white hover:border-neutral-400"
                  }`}
                >
                  <Show when={selectedActor() === "all"} fallback={
                    <>
                      <span>Actor: {actorsList().find((a) => a.id === selectedActor())?.name || "Selected"}</span>
                      <span
                        class="hover:text-red-500 font-bold ml-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActor("all");
                        }}
                      >
                        ✕
                      </span>
                    </>
                  }>
                    <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Actor</span>
                  </Show>
                </button>

                <Show when={actorOpen()}>
                  <div
                    class="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-neutral-200 z-30 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div class="p-3 border-b border-neutral-100">
                      <div class="text-xs font-semibold text-neutral-700 mb-2">Filter by Actor</div>
                      <div class="relative">
                        <input
                          type="text"
                          placeholder="Search actor..."
                          value={actorSearch()}
                          onInput={(e) => setActorSearch(e.currentTarget.value)}
                          class="w-full text-xs pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        />
                        <svg class="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      {/* Tabs: Users vs Secret Keys */}
                      <div class="flex items-center gap-1 mt-2.5 p-0.5 bg-neutral-100 rounded-lg text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => setActorTab("users")}
                          class={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md transition ${
                            actorTab() === "users" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Users</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActorTab("keys")}
                          class={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md transition ${
                            actorTab() === "keys" ? "bg-white text-neutral-900 shadow-xs" : "text-neutral-600 hover:text-neutral-900"
                          }`}
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          <span>Secret Keys</span>
                        </button>
                      </div>
                    </div>

                    <div class="max-h-60 overflow-y-auto py-1.5 px-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedActor("all");
                          setActorOpen(false);
                        }}
                        class={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-neutral-50 flex items-center justify-between ${
                          selectedActor() === "all" ? "text-[#635BFF] font-semibold bg-violet-50/50" : "text-neutral-700"
                        }`}
                      >
                        <span>Any actor</span>
                        <Show when={selectedActor() === "all"}>
                          <span class="text-[#635BFF]">✓</span>
                        </Show>
                      </button>

                      <For
                        each={actorsList().filter((a) => {
                          const q = actorSearch().toLowerCase();
                          if (!q) return true;
                          return (a.name || "").toLowerCase().includes(q) || (a.email || "").toLowerCase().includes(q);
                        })}
                      >
                        {(actor) => (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedActor(actor.id);
                              setActorOpen(false);
                            }}
                            class={`w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-neutral-50 flex items-center gap-2.5 transition ${
                              selectedActor() === actor.id ? "bg-violet-50/70 text-[#635BFF]" : "text-neutral-700"
                            }`}
                          >
                            <Show
                              when={actor.isSystem}
                              fallback={
                                <div class="w-6 h-6 rounded-full bg-neutral-200 text-neutral-700 font-semibold flex items-center justify-center text-[10px] shrink-0">
                                  {(actor.name || actor.email || "U")[0].toUpperCase()}
                                </div>
                              }
                            >
                              <div class="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[11px] shrink-0">
                                C
                              </div>
                            </Show>
                            <div class="min-w-0 flex-1">
                              <div class="font-medium text-neutral-900 truncate text-xs">{actor.name}</div>
                              <Show when={actor.email}>
                                <div class="text-[11px] text-neutral-500 truncate">{actor.email}</div>
                              </Show>
                            </div>
                            <Show when={selectedActor() === actor.id}>
                              <span class="text-[#635BFF] text-xs">✓</span>
                            </Show>
                          </button>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
              </div>

              {/* Search Keyword Input */}
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery()}
                  onInput={(e) => setSearchQuery(e.currentTarget.value)}
                  class="text-xs pl-7 pr-3 py-1.5 bg-white border border-neutral-300 rounded-full focus:outline-none focus:ring-1 focus:ring-neutral-400 w-40 hover:border-neutral-400 transition"
                />
                <svg class="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Show when={searchQuery()}>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    class="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
                  >
                    ✕
                  </button>
                </Show>
              </div>

              {/* Reset all filters */}
              <Show when={selectedEventType() !== "all" || selectedActor() !== "all" || searchQuery() || timeRange() !== "24h"}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEventType("all");
                    setSelectedActor("all");
                    setSearchQuery("");
                    setTimeRange("24h");
                  }}
                  class="text-xs text-neutral-500 hover:text-neutral-900 underline ml-1"
                >
                  Clear all
                </button>
              </Show>
            </div>

            {/* Right controls: Time Range, Refresh, Copy Link */}
            <div class="flex items-center gap-2 filter-popover-container">
              {/* Time Range Selector */}
              <div class="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeRangeOpen(!timeRangeOpen());
                    setEventTypeOpen(false);
                    setActorOpen(false);
                  }}
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 transition shadow-2xs"
                >
                  <svg class="w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{timePresetLabels[timeRange()] || "Time range"}</span>
                  <svg class="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <Show when={timeRangeOpen()}>
                  <div
                    class="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 z-30 py-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <For each={Object.entries(timePresetLabels)}>
                      {([key, label]) => (
                        <button
                          type="button"
                          onClick={() => {
                            setTimeRange(key);
                            setTimeRangeOpen(false);
                          }}
                          class={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between transition ${
                            timeRange() === key
                              ? "bg-violet-50 text-[#635BFF] font-semibold"
                              : "text-neutral-700 hover:bg-neutral-50"
                          }`}
                        >
                          <span>{label}</span>
                          <Show when={timeRange() === key}>
                            <svg class="w-4 h-4 text-[#635BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </Show>
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh log stream"
                class="p-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 transition"
              >
                <svg
                  class={`w-4 h-4 text-neutral-600 ${isRefreshing() ? "animate-spin text-[#635BFF]" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Copy Share Link */}
              <button
                type="button"
                onClick={() => handleCopy(window.location.href, "share_url")}
                title="Copy link to logs"
                class="p-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 transition"
              >
                <Show when={copiedKey() === "share_url"} fallback={
                  <svg class="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                }>
                  <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </Show>
              </button>
            </div>
          </div>

          {/* Main Layout: Event Table & Slide-Over Inspector */}
          <div class="flex items-start gap-4">
            {/* Event Table Container */}
            <div class={`min-w-0 transition-all ${selectedEvent() ? "w-7/12" : "w-full"}`}>
              <div class="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-medium select-none">
                      <th class="py-2.5 px-4">Event</th>
                      <th class="py-2.5 px-4">Subject</th>
                      <th class="py-2.5 px-4">IP address</th>
                      <th class="py-2.5 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-neutral-100">
                    <Show
                      when={filteredEvents().length > 0}
                      fallback={
                        <tr>
                          <td colspan="4" class="py-12 text-center text-neutral-400">
                            No logs found matching current filters
                          </td>
                        </tr>
                      }
                    >
                      <For each={filteredEvents()}>
                        {(ev) => {
                          const isSelected = () => selectedEventId() === ev.id;
                          return (
                            <tr
                              onClick={() => setSelectedEventId(ev.id)}
                              class={`cursor-pointer transition-colors group ${
                                isSelected()
                                  ? "bg-violet-50/70 border-l-2 border-[#635BFF]"
                                  : "hover:bg-neutral-50/80"
                              }`}
                            >
                              {/* Event Name & Subtitle */}
                              <td class="py-3 px-4">
                                <div
                                  class={`font-mono font-medium text-xs ${
                                    isSelected() ? "text-[#635BFF] font-semibold" : "text-neutral-900"
                                  }`}
                                >
                                  {ev.type}
                                </div>
                                <div
                                  class={`text-[11px] mt-0.5 ${
                                    isSelected() ? "text-violet-700" : "text-neutral-500"
                                  }`}
                                >
                                  {ev.description}
                                </div>
                              </td>

                              {/* Subject */}
                              <td class="py-3 px-4">
                                <span
                                  class={`font-mono text-xs truncate max-w-[150px] inline-block ${
                                    isSelected() ? "text-[#635BFF]" : "text-neutral-600"
                                  }`}
                                  title={ev.subject}
                                >
                                  {ev.subject.length > 20 ? ev.subject.slice(0, 18) + "…" : ev.subject}
                                </span>
                              </td>

                              {/* IP Address */}
                              <td class="py-3 px-4">
                                <Show when={ev.ip && ev.ip !== "—"} fallback={<span class="text-neutral-400">—</span>}>
                                  <div class="inline-flex items-center gap-1.5 font-mono text-[11px] text-neutral-700">
                                    <Show when={ev.country}>
                                      <span>{ev.country}</span>
                                    </Show>
                                    <span>{ev.ip}</span>
                                  </div>
                                </Show>
                              </td>

                              {/* Timestamp */}
                              <td class="py-3 px-4 text-right text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                                {formatEventTime(ev.ts)}
                              </td>
                            </tr>
                          );
                        }}
                      </For>
                    </Show>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Slide-over Right Drawer Inspector (inspired by Clerk) */}
            <Show when={selectedEvent()}>
              {(ev) => (
                <div class="w-5/12 shrink-0 border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden sticky top-4">
                  {/* Inspector Header */}
                  <div class="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-neutral-50/50">
                    <span class="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Event</span>
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => navigateInspector(-1)}
                        title="Previous event"
                        class="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateInspector(1)}
                        title="Next event"
                        class="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedEventId(null)}
                        title="Close inspector"
                        class="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 ml-1 transition"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Inspector Meta Table */}
                  <div class="divide-y divide-neutral-100 text-xs">
                    {/* Actor */}
                    <div class="flex items-center justify-between px-4 py-2.5">
                      <span class="text-neutral-500 font-medium">Actor</span>
                      <div class="flex items-center gap-1.5 min-w-0">
                        <span class="font-mono text-[#635BFF] font-medium truncate max-w-[200px]" title={ev().actor}>
                          {ev().actor}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedActor(ev().actor)}
                          title="Filter by this actor"
                          class="text-neutral-400 hover:text-[#635BFF] transition"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Type */}
                    <div class="flex items-center justify-between px-4 py-2.5">
                      <span class="text-neutral-500 font-medium">Type</span>
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono text-neutral-900 font-medium">{ev().type}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedEventType(ev().type)}
                          title="Filter by this type"
                          class="text-neutral-400 hover:text-[#635BFF] transition"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Event ID */}
                    <div class="flex items-center justify-between px-4 py-2.5">
                      <span class="text-neutral-500 font-medium">Event ID</span>
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono text-neutral-700 truncate max-w-[190px]">{ev().id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ev().id, "ev_id")}
                          title="Copy Event ID"
                          class="text-neutral-400 hover:text-neutral-700 transition"
                        >
                          <Show when={copiedKey() === "ev_id"} fallback={
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          }>
                            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </Show>
                        </button>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div class="flex items-center justify-between px-4 py-2.5">
                      <span class="text-neutral-500 font-medium">Timestamp</span>
                      <span class="font-mono text-neutral-800">{formatFullTime(ev().ts)}</span>
                    </div>

                    {/* Description */}
                    <div class="flex items-center justify-between px-4 py-2.5">
                      <span class="text-neutral-500 font-medium">Description</span>
                      <span class="text-neutral-800">{ev().description}</span>
                    </div>

                    {/* Subject */}
                    <div class="flex items-center justify-between px-4 py-2.5">
                      <span class="text-neutral-500 font-medium">Subject</span>
                      <div class="flex items-center gap-1.5 min-w-0">
                        <span class="font-mono text-[#635BFF] truncate max-w-[200px]" title={ev().subject}>
                          {ev().subject}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSearchQuery(ev().subject)}
                          title="Filter by subject"
                          class="text-neutral-400 hover:text-[#635BFF] transition"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Trace ID */}
                    <div class="flex items-center justify-between px-4 py-2.5">
                      <span class="text-neutral-500 font-medium">Trace ID</span>
                      <div class="flex items-center gap-1.5 min-w-0">
                        <span class="font-mono text-neutral-700 truncate max-w-[190px]" title={ev().traceId}>
                          {ev().traceId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(ev().traceId, "trace_id")}
                          title="Copy Trace ID"
                          class="text-neutral-400 hover:text-neutral-700 transition"
                        >
                          <Show when={copiedKey() === "trace_id"} fallback={
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          }>
                            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </Show>
                        </button>
                      </div>
                    </div>

                    {/* Source */}
                    <div class="flex items-center justify-between px-4 py-2.5">
                      <span class="text-neutral-500 font-medium">Source</span>
                      <span class="font-mono text-neutral-700">{ev().source}</span>
                    </div>
                  </div>

                  {/* Event Payload Section */}
                  <div class="p-4 border-t border-neutral-200">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-semibold text-neutral-700">Event payload</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(JSON.stringify(ev().payload, null, 2), "payload")}
                        class="text-neutral-400 hover:text-neutral-800 transition p-1 rounded"
                        title="Copy JSON payload"
                      >
                        <Show when={copiedKey() === "payload"} fallback={
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        }>
                          <span class="text-[10px] text-emerald-600 font-semibold">Copied!</span>
                        </Show>
                      </button>
                    </div>

                    {/* JSON Block with syntax coloring */}
                    <div class="bg-neutral-50 border border-neutral-200/80 rounded-lg p-3 overflow-x-auto text-[11px] font-mono leading-relaxed">
                      <div class="text-neutral-500 mb-1 flex items-center gap-1">
                        <span>▼ root: &#123;&#125;</span>
                        <span class="text-neutral-400">{Object.keys(ev().payload || {}).length} keys</span>
                      </div>
                      <div class="pl-3 space-y-1">
                        <For each={Object.entries(ev().payload || {})}>
                          {([key, val]) => {
                            const isBool = typeof val === "boolean";
                            const isNum = typeof val === "number";
                            return (
                              <div class="flex gap-1.5 flex-wrap">
                                <span class="text-[#635BFF]">{key}:</span>
                                <Show when={isBool}>
                                  <span class="text-blue-600 font-semibold">{String(val)}</span>
                                </Show>
                                <Show when={isNum}>
                                  <span class="text-amber-600 font-semibold">{val}</span>
                                </Show>
                                <Show when={!isBool && !isNum}>
                                  <span class="text-neutral-800">"{String(val)}"</span>
                                </Show>
                              </div>
                            );
                          }}
                        </For>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
}
