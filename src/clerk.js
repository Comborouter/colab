import { boot } from "./store.js";
import { api, logout } from "./api.js";
import { refresh } from "./actions.js";

export function loadClerkJs() {
  if (window.__ckload) return;
  if (!boot.pk || !boot.host) return;
  window.__ckload = 1;
  const sc = document.createElement("script");
  sc.async = true;
  sc.crossOrigin = "anonymous";
  sc.setAttribute("data-clerk-publishable-key", boot.pk);
  sc.src = "https://" + boot.host + "/npm/@clerk/clerk-js@6/dist/clerk.browser.js";
  document.head.appendChild(sc);
}

export function clerkSignOut() {
  let done = false;
  function finish() {
    if (done) return;
    done = true;
    try {
      localStorage.removeItem("wsEmail");
      localStorage.removeItem("claimed");
    } catch (e) {}
    try {
      const ns = ["__session", "__client_uat", "cw"];
      for (let i = 0; i < ns.length; i++) {
        document.cookie = ns[i] + "=; Path=/; Max-Age=0";
        document.cookie = ns[i] + "=; Path=/; Max-Age=0; SameSite=Lax";
      }
    } catch (e) {}
    logout();
  }
  loadClerkJs();
  const iv = setInterval(function () {
    if (!window.Clerk) return;
    clearInterval(iv);
    Clerk.load()
      .then(function () {
        if (!Clerk.session) return null;
        return Clerk.signOut();
      })
      .then(finish, finish);
  }, 200);
  setTimeout(finish, 8000);
}

export function wsEmailBootstrap() {
  if (window.__ckme) return;
  window.__ckme = 1;
  loadClerkJs();
  const iv2 = setInterval(function () {
    if (window.Clerk && !window.__ckbusy) {
      window.__ckbusy = 1;
      clearInterval(iv2);
      Clerk.load()
        .then(function () {
          const u = Clerk.user;
          const em =
            (u && u.primaryEmailAddress && u.primaryEmailAddress.emailAddress) ||
            (u && u.emailAddress) ||
            "";
          const nm =
            (u && u.fullName) ||
            (u && [u.firstName, u.lastName].filter(Boolean).join(" ")) ||
            "";
          const un = (u && u.username) || "";
          if (em) {
            localStorage.setItem("wsEmail", em);
            return api("/api/ws/me", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ email: em, name: nm, username: un }),
            })
              .then(function () {
                return refresh();
              })
              .then(
                function () {
                  window.__ckbusy = 0;
                },
                function () {
                  window.__ckbusy = 0;
                }
              );
          }
          window.__ckbusy = 0;
        })
        .catch(function () {
          window.__ckbusy = 0;
        });
    }
  }, 300);
}
