import { Show, createSignal } from "solid-js";
import WsLogo from "./WsLogo.jsx";

function downscale(file) {
  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = function () {
      try {
        const max = 256;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = h;
        const ctx = cv.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        cv.toBlob(
          function (blob) {
            if (!blob) {
              reject(new Error("could not process image"));
              return;
            }
            const r = new FileReader();
            r.onload = function () {
              resolve(String(r.result || ""));
            };
            r.onerror = function () {
              reject(new Error("could not read file"));
            };
            r.readAsDataURL(blob);
          },
          "image/jpeg",
          0.85
        );
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      reject(new Error("could not load image"));
    };
    img.src = url;
  });
}

export function readLogoFile(file) {
  return new Promise(function (resolve, reject) {
    if (!file) {
      reject(new Error("no file"));
      return;
    }
    if (!String(file.type || "").startsWith("image/")) {
      reject(new Error("not an image file"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error("image must be under 10 MB"));
      return;
    }
    downscale(file).then(resolve, reject);
  });
}

export default function LogoPicker(props) {
  const [err, setErr] = createSignal("");
  const [busy, setBusy] = createSignal(false);
  const pick = (e) => {
    const f = e.currentTarget.files ? e.currentTarget.files[0] : null;
    e.currentTarget.value = "";
    if (!f) return;
    setErr("");
    setBusy(true);
    readLogoFile(f)
      .then(function (dataUrl) {
        setBusy(false);
        props.onChange(dataUrl);
      })
      .catch(function (e) {
        setBusy(false);
        setErr(String((e && e.message) || e || "could not process image"));
      });
  };
  return (
    <div class="space-y-1.5">
      <div class="flex items-center gap-2">
        <WsLogo logo={props.value} name={props.name || "?"} size={28} />
        <label class="btn btn-xs cursor-pointer">
          {busy() ? "…" : props.value ? "change" : "upload"}
          <input type="file" accept="image/*" class="hidden" onChange={pick} />
        </label>
        <Show when={props.value && !busy()}>
          <button class="btn btn-xs" onClick={() => props.onChange("")}>
            remove
          </button>
        </Show>
      </div>
      <Show when={err()}>
        <span class="hint">{err()}</span>
      </Show>
    </div>
  );
}
