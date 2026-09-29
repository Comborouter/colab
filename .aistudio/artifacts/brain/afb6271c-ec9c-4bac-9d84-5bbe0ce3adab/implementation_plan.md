# Implementation Plan - Lightweight Clerk-Inspired Logs Interface

## Overview
Transform the current minimal raw log box in the **Logs** tab into a clean, modern, and lightweight audit log explorer inspired by Clerk's log interface. It will provide fast filtering (by search, event type, and actor), quick time presets (15m, 1h, 24h, 7d, All), an organized event stream table, and a slide-over right drawer inspector displaying event metadata and expandable payload JSON.

---

## Key Requirements & User Preferences
- **Layout & Sub-Navigation**:
  - Left mini-sidebar or category pill selector: **Application** (runtime & VM events) and **System / Auth** (authentication, session tokens, invites).
- **Filter Bar**:
  - Search bar filtering instantly by keyword, event type, subject, or detail.
  - **Event Type** dropdown filter: Filter by specific event categories (e.g., `session.created`, `vm.booted`, `token.refresh`, `error.fail`, etc.).
  - **Actor** dropdown filter: Filter by system vs. specific team member or user.
  - **Time Range** dropdown: Quick presets (`Last 15m`, `Last 1h`, `Last 24h`, `Last 7d`, `All`) with active indicator.
  - Quick refresh ⟳ button and live event count.
- **Event Table**:
  - Columns: **Event** (badge + human-friendly description), **Subject** (session ID or resource slug), **Actor / IP** (initiating user or client IP), and **Timestamp** (formatted relative/local time).
  - Selected row state with soft violet highlight border.
  - Error and warning events styled with clear visual badges.
- **Slide-Over Right Drawer Inspector**:
  - Clicking any row opens or pins the detail inspector on the right.
  - Header with event title, status, and close `✕` button.
  - Key-value metadata table: Actor, Type, Event ID (with copy button), Timestamp, Subject, and Source.
  - **Event Payload** section: Clean JSON syntax block with copy-to-clipboard action.
- **Integration with Real App State**:
  - Binds directly to `state.events` and real-time VM session events from `/api/status` and `/events`.
  - Supports seeding initial representative audit events (VM created, OAuth connected, workspace invite issued, session booted) so the log is instantly useful and demonstrative.

---

## Proposed Changes

### 1. New Component: `src/components/LogsTab.jsx`
- Replace or enhance `SessionPanel.jsx` with a comprehensive `LogsTab.jsx` component.
- Implements:
  - Sub-category navigation (`Application`, `System & Auth`).
  - Search input with clear button.
  - Filter pills: `Event Type` dropdown, `Actor` dropdown, and `Time Range` preset dropdown.
  - Responsive layout: Main event list + side drawer inspector (collapsible).
  - Copy actions for Event ID, payload JSON, and filter-by shortcuts.

### 2. Integration with `Dash.jsx`
- Replace `SessionPanel` with `LogsTab` under `<Show when={dashTab() === "logs"}>`.
- Retain lightweight quick drawer if invoked from header session indicator (`sessOpen`).

### 3. Event Enricher & Persistence
- Ensure session events, workspace changes, and invite activities push structured audit events to `state.events` with fields: `id`, `kind`, `actor`, `subject`, `ip`, `ts`, `payload`.

---

## Verification Plan
1. **Compilation**: Run `compile_applet` to confirm zero TypeScript/JSX syntax errors.
2. **Interactive Testing**:
   - Navigate to the **Logs** tab from the top navigation.
   - Filter by Event Type (e.g. `session.created` or `vm.started`).
   - Filter by Actor (e.g. current user or System).
   - Change Time Presets and verify events filter accurately.
   - Click a log row to open the slide-over inspector; verify metadata and copy payload.
   - Test search bar filtering.
