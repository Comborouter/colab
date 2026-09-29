import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { boot } from "../store.js";
import { API } from "../api.js";
import { loadClerkJs } from "../clerk.js";

export default function Login() {
  let expect = false;
  try {
    let rh = "";
    try {
      rh = document.referrer ? new URL(document.referrer).hostname : "";
    } catch (e2) {}
    if (rh && boot.host && (rh === boot.host || rh.indexOf("clerk") !== -1)) expect = true;
    if (location.search.indexOf("__clerk") !== -1) expect = true;
    const m = (document.cookie || "").match(/(?:^|;\s*)__client_uat=([^;]*)/);
    if (m && m[1] && m[1] !== "0") expect = true;
  } catch (e) {}

  const err = () => /[?&]err=1/.test(location.search);
  const [denied, setDenied] = createSignal(false);
  const showErr = () => denied() || err();
  const [showForm, setShowForm] = createSignal(!expect);
  const [showSpin, setShowSpin] = createSignal(expect);
  let revealed = false;
  let tried = 0;

  const reveal = function () {
    if (revealed) return;
    revealed = true;
    setShowSpin(false);
    setShowForm(true);
  };

  onMount(function () {
    loadClerkJs();
    if (expect) setTimeout(reveal, 8000);
    const iv = setInterval(function () {
      if (!window.Clerk || tried) return;
      tried = 1;
      Clerk.load()
        .then(function () {
          if (Clerk.session) {
            location.replace("/");
            return;
          }
          tried = 0;
          if (expect) reveal();
        })
        .catch(function () {
          tried = 0;
          if (expect) reveal();
        });
    }, 300);
    onCleanup(function () {
      clearInterval(iv);
    });
  });

  function doLogin(e) {
    e.preventDefault();
    setDenied(false);
    const fd = new FormData(e.currentTarget);
    fetch(API + "/login", {
      method: "POST",
      body: fd,
      credentials: "include",
      redirect: "manual",
    })
      .then(function (r) {
        if (r.status === 200 || r.type === "opaqueredirect") location.href = "/";
        else setDenied(true);
      })
      .catch(function () {
        setDenied(true);
      });
  }

  function clksiClick(e) {
    const b = e.currentTarget;
    b.disabled = true;
    let n = 0;
    const t = setInterval(function () {
      n++;
      if (window.Clerk) {
        clearInterval(t);
        Clerk.load()
          .then(function () {
            return Clerk.redirectToSignIn({
              redirectUrl: location.pathname + location.search,
            });
          })
          .catch(function () {
            b.disabled = false;
          });
      } else if (n > 60) {
        clearInterval(t);
        b.disabled = false;
      }
    }, 150);
  }

  return (
    <div class="min-h-screen flex items-center justify-center">
      <Show when={showForm()}>
        <form
          onSubmit={doLogin}
          class="w-80 border border-neutral-200 rounded-lg p-7 shadow-sm"
        >
          <h1 class="text-base font-semibold tracking-tight">colab-cli</h1>
          <p class="text-xs text-neutral-500 mt-0.5 mb-5">
            keepalive control plane for colab sessions
          </p>
          <Show when={showErr()}>
            <p class="text-xs text-neutral-800 border border-neutral-300 bg-neutral-50 rounded px-2.5 py-2 mb-4">
              wrong password
            </p>
          </Show>
          <Show when={boot.pw !== false}>
            <input
              type="password"
              name="password"
              placeholder="dashboard password"
              autofocus
              class="w-full text-sm border border-neutral-300 rounded px-3 py-2 mb-3 focus:outline-none focus:border-neutral-900"
            />
            <button class="w-full text-sm font-medium bg-neutral-900 text-white rounded px-3 py-2 hover:bg-neutral-700">
              log in
            </button>
            <div class="flex items-center gap-2 my-3">
              <span class="flex-1 border-t border-neutral-200"></span>
              <span class="text-[10px] text-neutral-400">or</span>
              <span class="flex-1 border-t border-neutral-200"></span>
            </div>
          </Show>
          <button
            type="button"
            class="w-full text-sm font-medium border border-neutral-300 bg-white rounded px-3 py-2 hover:border-neutral-900"
            onClick={clksiClick}
          >
            continue with email / google
          </button>
        </form>
      </Show>
      <Show when={showSpin()}>
        <div class="w-80 border border-neutral-200 rounded-lg p-7 shadow-sm text-center">
          <div class="spin" style="margin:0 auto"></div>
          <p class="text-xs text-neutral-500 mt-3">finishing sign-in…</p>
        </div>
      </Show>
    </div>
  );
}
