import { Show, createSignal } from "solid-js";
import { createWsOpen, setCreateWsOpen } from "../store.js";
import { wsCreate } from "../actions.js";
import { readLogoFile } from "./LogoPicker.jsx";

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export default function CreateWorkspaceModal() {
  const [name, setName] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [touched, setTouched] = createSignal(false);
  const [logo, setLogo] = createSignal("");
  const [err, setErr] = createSignal("");
  let fileInput = null;
  const close = () => {
    setCreateWsOpen(false);
    setName("");
    setSlug("");
    setTouched(false);
    setLogo("");
    setErr("");
  };
  const onName = (e) => {
    const v = e.currentTarget.value;
    setName(v);
    if (!touched()) setSlug(slugify(v));
  };
  const onSlug = (e) => {
    setTouched(true);
    setSlug(e.currentTarget.value);
  };
  const onFile = (e) => {
    const f = e.currentTarget.files ? e.currentTarget.files[0] : null;
    e.currentTarget.value = "";
    if (!f) return;
    setErr("");
    readLogoFile(f).then(
      function (dataUrl) {
        setLogo(dataUrl);
      },
      function (e) {
        setErr(String((e && e.message) || e || "could not process image"));
      }
    );
  };
  const submit = () => {
    setErr("");
    wsCreate(name(), logo(), slug());
  };
  return (
    <Show when={createWsOpen()}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div class="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div class="flex items-start justify-between px-7 pt-6 pb-2">
            <h2 class="text-[22px] font-semibold tracking-tight text-gray-900">
              Create workspace
            </h2>
            <button
              class="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
              onClick={close}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          <div class="space-y-6 px-7 py-5">
            <div class="space-y-3">
              <label class="block text-[15px] font-medium text-gray-900">Logo</label>
              <div class="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInput && fileInput.click()}
                  class="flex h-[86px] w-[86px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400 transition hover:border-gray-400 hover:bg-gray-100"
                >
                  <Show
                    when={logo()}
                    fallback={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 3a.75.75 0 0 1 .55.24l3 3.25a.75.75 0 1 1-1.1 1.02L10.75 5.8v5.45a.75.75 0 0 1-1.5 0V5.8l-1.7 1.71a.75.75 0 1 1-1.1-1.02l3-3.25A.75.75 0 0 1 10 3Z"
                          clip-rule="evenodd"
                        />
                        <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5c0 1.24 1 2.25 2.25 2.25h11.5c1.24 0 2.25-1 2.25-2.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .41-.34.75-.75.75H4.25a.75.75 0 0 1-.75-.75v-2.5Z" />
                      </svg>
                    }
                  >
                    <img src={logo()} alt="" class="h-full w-full object-cover" />
                  </Show>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  ref={(el) => (fileInput = el)}
                  onChange={onFile}
                />
                <div class="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => fileInput && fileInput.click()}
                    class="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[15px] font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 active:bg-gray-100"
                  >
                    Upload
                  </button>
                  <p class="text-[13px] leading-snug text-gray-500">
                    Recommended size 1:1, up to 10MB.
                  </p>
                </div>
              </div>
              <Show when={err()}>
                <span class="hint">{err()}</span>
              </Show>
            </div>
            <div class="space-y-2">
              <label class="block text-[15px] font-medium text-gray-900">Name</label>
              <input
                type="text"
                placeholder="Workspace name"
                maxlength="40"
                value={name()}
                onInput={onName}
                class="w-full rounded-lg border border-gray-900 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder-gray-400 shadow-[0_0_0_3px_rgba(59,130,246,0.12)] outline-none focus:border-gray-900"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-[15px] font-medium text-gray-900">Slug</label>
              <input
                type="text"
                placeholder="my-org"
                maxlength="40"
                value={slug()}
                onInput={onSlug}
                class="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder-gray-400 outline-none transition focus:border-gray-900 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
              />
            </div>
            <div class="flex justify-end pt-1">
              <button
                type="button"
                disabled={!name().trim()}
                onClick={submit}
                class="rounded-lg bg-indigo-400 px-4 py-2.5 text-[15px] font-medium text-white shadow-sm transition hover:bg-indigo-500 active:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create workspace
              </button>
            </div>
          </div>
          <div class="flex items-center justify-center gap-1.5 border-t border-gray-100 bg-gray-50/60 py-3.5 text-[13px] text-gray-500">
            <span>Secured by</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              class="h-4 w-4 fill-gray-700"
            >
              <circle cx="12" cy="12" r="9" />
            </svg>
            <span class="font-semibold text-gray-800">clerk</span>
          </div>
        </div>
      </div>
    </Show>
  );
}
