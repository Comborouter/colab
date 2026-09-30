// In-memory mock backend for colab-cli in AI Studio
// Provides state persistence during runtime session

export function createMockApiMiddleware() {
  const wsId = "ins_3JoTllbTfg3cVW9a748XsanbOuK";
  const userId = "user_mwila";

  const defaultUser = {
    id: userId,
    name: "Mwila _",
    email: "mpnyirongo@gmail.com",
    admin: true,
    kind: "admin",
  };

  const defaultWs = {
    id: wsId,
    name: "Main Workspace",
    slug: "main",
    logo: "",
    members: [
      {
        id: userId,
        name: "Mwila _",
        email: "mpnyirongo@gmail.com",
        username: "mwila",
        phone: "-",
        last_signed_in: "September 29, 2026",
        joined: "September 29, 2026",
        role: "Admin",
      },
      {
        id: "user_yoyapazed",
        name: "yoyapazed yoyapazed",
        email: "yoyapazed@gmail.com",
        username: "bbbbb",
        phone: "-",
        last_signed_in: "September 26, 2026",
        joined: "September 26, 2026",
        role: "Member",
      },
      {
        id: "user_logariddim",
        name: "logariddim",
        email: "logariddim4@gmail.com",
        username: "logg",
        phone: "-",
        last_signed_in: "September 29, 2026",
        joined: "September 26, 2026",
        role: "Member",
      },
    ],
  };

  let sessions = [
    {
      id: "sess_101",
      name: "T4 GPU Training",
      endpoint: "vm-us-west-gpu-1",
      accelerator: "T4",
      high_mem: false,
      provider: "colab",
      profile: "mpnyirongo@gmail.com",
      created_at: Date.now() - 3600000 * 4,
      last_keepalive: Date.now() - 45000,
      dead_at: null,
    },
    {
      id: "sess_102",
      name: "ComfyUI Node",
      endpoint: "vm-us-central-gpu-2",
      accelerator: "A100",
      high_mem: true,
      provider: "colab",
      profile: "mpnyirongo@gmail.com",
      created_at: Date.now() - 3600000 * 2,
      last_keepalive: Date.now() - 30000,
      dead_at: null,
    },
  ];

  let profiles = [
    {
      email: "mpnyirongo@gmail.com",
      expiry: Date.now() + 3600000 * 4,
    },
    {
      email: "bytebridgestudios@gmail.com",
      expiry: Date.now() + 3600000 * 2,
    },
  ];

  let apps = [
    {
      name: "comfyui",
      size: 4200000,
      uploaded: Date.now() - 86400000,
      meta: {
        title: "ComfyUI Web",
        version: "v1.2.0",
        type: "app",
        port: 8188,
        description: "Modular node-based UI for Stable Diffusion and FLUX inference.",
        author: "Comfy-Org",
        downloads: 24,
        screenshots: [],
        vars: [
          { name: "EXTRA_ARGS", label: "Extra launch arguments", default: "--preview-method auto", required: false },
        ],
      },
    },
    {
      name: "jupyterlab",
      size: 1800000,
      uploaded: Date.now() - 86400000 * 2,
      meta: {
        title: "JupyterLab Extended",
        version: "v4.0.5",
        type: "app",
        port: 8888,
        description: "Interactive computing environment with full terminal and GPU monitoring extensions.",
        author: "Project Jupyter",
        downloads: 58,
        screenshots: [],
        vars: [],
      },
    },
    {
      name: "cloudflared-ext",
      size: 950000,
      uploaded: Date.now() - 86400000 * 3,
      meta: {
        title: "Cloudflare Tunnel Agent",
        version: "v2.1.0",
        type: "extension",
        target: "tunnel",
        description: "Exposes local notebook ports to temporary public trycloudflare URLs.",
        author: "Cloudflare",
        downloads: 82,
        screenshots: [],
        vars: [],
      },
    },
  ];

  let appStates = {
    "vm-us-west-gpu-1": {
      jupyterlab: {
        installed: true,
        running: true,
        since: Date.now() - 3600000,
        url: "https://jupyter-colab-preview.trycloudflare.com",
      },
      comfyui: {
        installed: true,
        running: false,
      },
    },
    "vm-us-central-gpu-2": {
      comfyui: {
        installed: true,
        running: true,
        since: Date.now() - 5400000,
        url: "https://comfyui-node-colab.trycloudflare.com",
      },
    },
  };

  let events = [
    {
      id: 105,
      kind: "keepalive.tick",
      detail: "Heartbeat refreshed for vm-us-west-gpu-1 (T4)",
      endpoint: "vm-us-west-gpu-1",
      ts: new Date(Date.now() - 45000).toISOString(),
    },
    {
      id: 104,
      kind: "app.launch",
      detail: "Launched ComfyUI Web on vm-us-central-gpu-2",
      endpoint: "vm-us-central-gpu-2",
      ts: new Date(Date.now() - 5400000).toISOString(),
    },
    {
      id: 103,
      kind: "keepalive.tick",
      detail: "Heartbeat refreshed for vm-us-central-gpu-2 (A100)",
      endpoint: "vm-us-central-gpu-2",
      ts: new Date(Date.now() - 30000).toISOString(),
    },
    {
      id: 102,
      kind: "session.assigned",
      detail: "Assigned Colab session vm-us-central-gpu-2 with A100 GPU",
      endpoint: "vm-us-central-gpu-2",
      ts: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 101,
      kind: "session.assigned",
      detail: "Assigned Colab session vm-us-west-gpu-1 with T4 GPU",
      endpoint: "vm-us-west-gpu-1",
      ts: new Date(Date.now() - 14400000).toISOString(),
    },
  ];

  let marketItems = [
    {
      name: "sd-webui",
      title: "Stable Diffusion WebUI (AUTOMATIC1111)",
      category: "apps",
      url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
      description: "Web interface for Stable Diffusion models with ControlNet and LoRA support.",
      added: Date.now() - 86400000 * 5,
    },
    {
      name: "ollama-runner",
      title: "Ollama LLM Server",
      category: "apps",
      url: "https://github.com/ollama/ollama",
      description: "Run Llama 3, Mistral, and DeepSeek models locally with GPU acceleration on Colab.",
      added: Date.now() - 86400000 * 3,
    },
    {
      name: "fooocus",
      title: "Fooocus Image Generator",
      category: "apps",
      url: "https://github.com/lllyasviel/Fooocus",
      description: "Focus on prompting and generating without complex parameter tuning.",
      added: Date.now() - 86400000 * 2,
    },
    {
      name: "tensorboard-ext",
      title: "TensorBoard Live",
      category: "tools",
      url: "https://github.com/tensorflow/tensorboard",
      description: "Visualize training metrics, loss curves, and profiling charts.",
      added: Date.now() - 86400000 * 1,
    },
  ];

  let nextEventId = 106;

  function addEvent(kind, detail, endpoint = "") {
    const ev = {
      id: nextEventId++,
      kind,
      detail,
      endpoint,
      ts: new Date().toISOString(),
    };
    events.unshift(ev);
    if (events.length > 200) events.pop();
    return ev;
  }

  function parseBody(req) {
    return new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          resolve(JSON.parse(body || "{}"));
        } catch (e) {
          resolve({});
        }
      });
    });
  }

  function json(res, data, status = 200) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.end(JSON.stringify(data));
  }

  return async function mockApiMiddleware(req, res, next) {
    const url = new URL(req.url, "http://localhost");
    const pathname = url.pathname;

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      return res.end();
    }

    // State Endpoint
    if (pathname === "/api/state") {
      const cursor = parseInt(url.searchParams.get("ev") || "0", 10);
      const evs = cursor ? events.filter((e) => e.id > cursor) : events.slice(0, 50);

      return json(res, {
        ok: true,
        sessions,
        events: evs,
        apps,
        profiles,
        auth: {
          hasTokens: profiles.length > 0,
          expiry: Date.now() + 3600000 * 2,
        },
        ws: defaultWs,
        user: defaultUser,
      });
    }

    // Login
    if (pathname === "/login") {
      res.setHeader("Set-Cookie", "claimed=1; Path=/; SameSite=Lax");
      return json(res, { ok: true, user: defaultUser });
    }

    // Logout
    if (pathname === "/logout") {
      res.setHeader("Set-Cookie", "claimed=0; Path=/; Max-Age=0; SameSite=Lax");
      return json(res, { ok: true });
    }

    // Connect URL (Google Colab OAuth flow)
    if (pathname === "/api/connect-url") {
      return json(res, {
        ok: true,
        url: "https://accounts.google.com/o/oauth2/auth?scope=colab&state=mock_connect",
      });
    }

    // Connect Submit
    if (pathname === "/api/connect-submit") {
      const body = await parseBody(req);
      const code = String(body.code || "").trim();
      const newEmail = "colab-user-" + Math.floor(Math.random() * 1000) + "@gmail.com";
      profiles.push({
        email: newEmail,
        expiry: Date.now() + 3600000 * 4,
      });
      addEvent("account.connected", `Connected Google account ${newEmail}`);
      return json(res, { ok: true, email: newEmail });
    }

    // Remove Profile
    if (pathname === "/api/profiles/remove") {
      const body = await parseBody(req);
      profiles = profiles.filter((p) => p.email !== body.email);
      addEvent("account.removed", `Removed connected account ${body.email}`);
      return json(res, { ok: true });
    }

    // New Session
    if (pathname === "/api/new") {
      const body = await parseBody(req);
      const name = body.name ? String(body.name).trim() : "Colab VM";
      const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const ep = `vm-${cleanSlug || "colab"}-${Math.random().toString(36).slice(2, 6)}`;
      const newSess = {
        id: `sess_${Date.now()}`,
        name: name,
        endpoint: ep,
        accelerator: body.accelerator || "T4",
        high_mem: !!body.high_mem,
        provider: body.provider || "colab",
        profile: body.profile || (profiles[0] ? profiles[0].email : "mpnyirongo@gmail.com"),
        created_at: Date.now(),
        last_keepalive: Date.now(),
        dead_at: null,
      };
      sessions.unshift(newSess);
      appStates[ep] = {};
      addEvent("session.assigned", `Assigned session ${name} (${newSess.accelerator}) at ${ep}`, ep);
      return json(res, { ok: true, name: name, endpoint: ep });
    }

    // Stop Session
    if (pathname === "/api/stop") {
      const body = await parseBody(req);
      const ep = body.endpoint;
      const target = sessions.find((s) => s.endpoint === ep);
      if (target) {
        target.dead_at = Date.now();
        addEvent("session.stopped", `Stopped session ${target.name} (${ep})`, ep);
      }
      return json(res, { ok: true });
    }

    // Rename Session
    if (pathname === "/api/rename") {
      const body = await parseBody(req);
      const target = sessions.find((s) => s.endpoint === body.endpoint);
      if (target && body.name) {
        target.name = body.name;
        addEvent("session.renamed", `Renamed session to ${body.name}`, body.endpoint);
      }
      return json(res, { ok: true });
    }

    // App Actions
    if (pathname === "/api/apps/action") {
      const body = await parseBody(req);
      const { action, name, endpoint, vars } = body;
      if (!appStates[endpoint]) appStates[endpoint] = {};

      if (action === "status") {
        return json(res, { ok: true, all: appStates[endpoint] || {} });
      }

      if (action === "install") {
        appStates[endpoint][name] = {
          installed: true,
          installing: false,
          failed: false,
          since: null,
          url: null,
        };
        addEvent("app.installed", `Installed app ${name} on ${endpoint}`, endpoint);
        return json(res, { ok: true, all: appStates[endpoint] });
      }

      if (action === "launch") {
        const tunnelUrl = `https://${name}-${endpoint.slice(-6)}.trycloudflare.com`;
        appStates[endpoint][name] = {
          installed: true,
          installing: false,
          running: true,
          failed: false,
          since: Date.now(),
          url: tunnelUrl,
        };
        addEvent("app.launch", `Launched app ${name} on ${endpoint} -> ${tunnelUrl}`, endpoint);
        return json(res, { ok: true, all: appStates[endpoint] });
      }

      if (action === "stop") {
        if (appStates[endpoint][name]) {
          appStates[endpoint][name].running = false;
          appStates[endpoint][name].url = null;
        }
        addEvent("app.stop", `Stopped app ${name} on ${endpoint}`, endpoint);
        return json(res, { ok: true, all: appStates[endpoint] });
      }

      return json(res, { ok: true, all: appStates[endpoint] });
    }

    // App Delete
    if (pathname === "/api/apps/delete") {
      const body = await parseBody(req);
      apps = apps.filter((a) => a.name !== body.name);
      addEvent("app.deleted", `Removed app ${body.name} from registry`);
      return json(res, { ok: true });
    }

    // App Upload
    if (pathname === "/api/apps/upload") {
      const appName = "custom-app-" + Math.floor(Math.random() * 1000);
      const newApp = {
        name: appName,
        size: 1024 * 512,
        uploaded: Date.now(),
        meta: {
          title: "Custom Uploaded App",
          version: "v1.0.0",
          type: "app",
          port: 8080,
          description: "Uploaded custom application archive.",
          author: defaultUser.name,
          downloads: 1,
        },
      };
      apps.unshift(newApp);
      addEvent("app.uploaded", `Uploaded new app package ${appName}`);
      return json(res, { ok: true, name: appName });
    }

    // Marketplace
    if (pathname === "/api/market") {
      if (req.method === "GET") {
        return json(res, { ok: true, items: marketItems });
      }
      if (req.method === "POST") {
        const body = await parseBody(req);
        marketItems.push({
          name: body.name || "custom-community-app",
          title: body.title || body.name || "Community App",
          category: body.category || "apps",
          url: body.url || "",
          description: body.description || "",
          added: Date.now(),
        });
        return json(res, { ok: true });
      }
      if (req.method === "DELETE") {
        const body = await parseBody(req);
        marketItems = marketItems.filter((i) => i.name !== body.name);
        return json(res, { ok: true });
      }
    }

    // Workspace Routes
    if (pathname === "/api/ws/invite") {
      const origin = req.headers.origin || `http://${req.headers.host || "localhost:3000"}`;
      const inviteUrl = `${origin}/?invite=wsinv_${Math.random().toString(36).slice(2, 10)}`;
      addEvent("workspace.invite", `Created invite link for ${defaultWs.name}`);
      return json(res, { ok: true, url: inviteUrl });
    }

    if (pathname === "/api/ws/create") {
      const body = await parseBody(req);
      if (body.name) defaultWs.name = body.name;
      if (body.slug) defaultWs.slug = body.slug;
      if (body.logo) defaultWs.logo = body.logo;
      return json(res, { ok: true });
    }

    if (pathname === "/api/ws/rename") {
      const body = await parseBody(req);
      if (body.name) defaultWs.name = body.name;
      return json(res, { ok: true });
    }

    if (pathname === "/api/ws/logo") {
      const body = await parseBody(req);
      if (body.logo) defaultWs.logo = body.logo;
      return json(res, { ok: true });
    }

    if (pathname === "/api/ws/switch" || pathname === "/api/ws/join" || pathname === "/api/ws/me") {
      return json(res, { ok: true });
    }

    // Raw views
    if (pathname === "/sessions") {
      res.setHeader("Content-Type", "text/plain");
      return res.end(
        sessions
          .map((s) => `${s.endpoint}\t${s.name}\t${s.accelerator}\t${s.dead_at ? "DEAD" : "ALIVE"}`)
          .join("\n")
      );
    }

    if (pathname === "/events") {
      res.setHeader("Content-Type", "text/plain");
      return res.end(
        events
          .map((e) => `[${e.ts}] ${e.kind}: ${e.detail} (${e.endpoint || "global"})`)
          .join("\n")
      );
    }

    // Not handled by mock API
    next();
  };
}
