import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { boot, setClaimed, claimed, lsGet } from "../store.js";
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
  const [msg, setMsg] = createSignal("");
  const showErr = () => denied() || !!msg() || err();
  const errText = () => msg() || "wrong password";
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
    // If user has existing session or wsEmail, auto-claim
    if (lsGet("wsEmail") || lsGet("claimed") === "1") {
      setClaimed(true);
      return;
    }

    loadClerkJs();
    if (expect) setTimeout(reveal, 2500);

    const checkSession = function () {
      if (!window.Clerk) return;
      if (window.Clerk.session || window.Clerk.user) {
        try {
          if (location.search.indexOf("__clerk") !== -1) {
            window.history.replaceState({}, document.title, location.pathname);
          }
        } catch (e) {}
        setClaimed(true);
        return true;
      }
      return false;
    };

    const attachListener = function () {
      if (window.Clerk && typeof window.Clerk.addListener === "function" && !window.__cklistened) {
        window.__cklistened = 1;
        window.Clerk.addListener(function (emission) {
          if (emission && (emission.session || emission.user)) {
            setClaimed(true);
          }
        });
      }
    };

    const iv = setInterval(function () {
      if (!window.Clerk) return;
      attachListener();
      if (checkSession()) return;
      if (tried) return;
      tried = 1;
      Clerk.load()
        .then(function () {
          if (checkSession()) return;
          tried = 0;
          if (expect) reveal();
        })
        .catch(function () {
          tried = 0;
          if (expect) reveal();
        });
    }, 200);

    onCleanup(function () {
      clearInterval(iv);
    });
  });

  function doLogin(e) {
    e.preventDefault();
    setDenied(false);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    fetch(API + "/login", {
      method: "POST",
      body: fd,
      credentials: "include",
      redirect: "manual",
    })
      .then(function (r) {
        if (r.status === 200 || r.type === "opaqueredirect") {
          setClaimed(true);
          location.href = "/";
        } else {
          setDenied(true);
        }
      })
      .catch(function () {
        setDenied(true);
      });
  }

  function clksiClick(e) {
    if (!boot.pk || !boot.host) {
      setMsg("sign-in is not configured on this build (no clerk key)");
      return;
    }
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
            setMsg("could not start sign-in, try again");
          });
      } else if (n > 20) {
        clearInterval(t);
        b.disabled = false;
        setMsg("sign-in service did not load, check your connection");
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
          <h1 class="text-base font-semibold tracking-tight text-center mb-5">
            combo
          </h1>
          <Show when={showErr()}>
            <p class="text-xs text-neutral-800 border border-neutral-300 bg-neutral-50 rounded px-2.5 py-2 mb-4">
              {errText()}
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
          <p class="text-xs text-neutral-500 mt-3 mb-4">finishing sign-in…</p>
          <div class="flex flex-col gap-2">
            <Show when={lsGet("wsEmail")}>
              <button
                type="button"
                onClick={() => setClaimed(true)}
                class="w-full text-xs font-medium bg-neutral-900 text-white rounded px-3 py-1.5 hover:bg-neutral-800 transition cursor-pointer"
              >
                Continue as {lsGet("wsEmail")}
              </button>
            </Show>
            <button
              type="button"
              onClick={reveal}
              class="w-full text-xs text-neutral-500 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 rounded px-3 py-1.5 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Show>
    </div>
  );
}
