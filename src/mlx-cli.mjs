const configuredBaseUrl = process.env.TELEPHONES_BASE_URL
  ? [process.env.TELEPHONES_BASE_URL]
  : ["http://localhost:5180", "http://localhost:5177"];
let activeBaseUrl = configuredBaseUrl[0].replace(/\/$/, "");
const [, , command, ...args] = process.argv;

function usage() {
  console.log(`Usage:
  npm run mlx -- status
  npm run mlx -- profiles [search text]
  npm run mlx -- start <profile_id> [folder_id]
  npm run mlx -- stop <profile_id>
  npm run mlx -- open-x <profile_id>
  npm run mlx -- scroll <profile_id> [count]
  npm run mlx -- install-x <profile_id>
  npm run mlx -- operator
  npm run mlx -- work <profile_id> [preset_id]
  npm run mlx -- plan <profile_id> [preset_id]
  npm run mlx -- prepare <profile_id> [preset_id]
  npm run mlx -- session-start <session_id>
  npm run mlx -- session-done <session_id> [notes]
  npm run mlx -- session-skip <session_id> [notes]
  npm run mlx -- session-attention <session_id> [notes]
  npm run mlx -- session-stop <session_id> [notes]

Environment:
  TELEPHONES_BASE_URL=${activeBaseUrl}`);
}

async function request(path, options = {}) {
  let lastError = null;

  for (const candidate of configuredBaseUrl) {
    activeBaseUrl = candidate.replace(/\/$/, "");
    try {
      const response = await fetch(`${activeBaseUrl}${path}`, {
        headers: {
          "content-type": "application/json",
          ...(options.headers ?? {})
        },
        ...options
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || `Request failed with ${response.status}`);
      }
      return payload;
    } catch (error) {
      lastError = error;
      if (configuredBaseUrl.length === 1 || !String(error.cause?.code || error.message).includes("fetch failed")) {
        throw error;
      }
    }
  }

  throw lastError;
}

function rowForProfile(profile) {
  return {
    type: profile.profileType || "browser",
    name: profile.name,
    id: profile.id,
    folder: profile.folderName || profile.folderId || "",
    folderId: profile.folderId || "",
    status: profile.status || "unknown",
    browser: profile.browserType || "",
    os: profile.osType || ""
  };
}

async function listProfiles(search = "", { silent = false } = {}) {
  const query = new URLSearchParams({
    limit: "100",
    search
  });
  const result = await request(`/api/multilogin/profiles?${query}`);
  if (!silent) console.table(result.profiles.map(rowForProfile));
  if (!silent && !result.profiles.length) {
    console.log("No Multilogin profiles found.");
  }
  return result;
}

async function resolveFolderId(profileId, folderId) {
  if (folderId) return { folderId, profileType: "browser" };

  const result = await listProfiles("", { silent: true });
  const profile = result.profiles.find((item) => item.id === profileId);
  if (profile?.profileType === "mobile") {
    return { folderId: "", profileType: "mobile" };
  }
  if (!profile?.folderId) {
    throw new Error("Could not resolve folder_id. Run `npm run mlx -- profiles` and pass the folder_id as the third argument.");
  }
  return { folderId: profile.folderId, profileType: "browser" };
}

async function resolveProfile(profileId) {
  const fallback = {
    id: profileId,
    name: profileId,
    profileType: "browser",
    folderId: ""
  };

  try {
    const result = await listProfiles("", { silent: true });
    return result.profiles.find((profile) => profile.id === profileId) || fallback;
  } catch {
    return fallback;
  }
}

function summarizeSession(session) {
  return {
    status: session.status,
    profile: session.profileName,
    preset: session.presetLabel,
    prompt: session.currentPrompt?.label || "",
    next: session.nextPromptAt || "",
    id: session.id
  };
}

function summarizeTask(task) {
  return {
    status: task.status,
    function: task.functionLabel,
    profile: task.profileName,
    scheduled: task.scheduledFor || "",
    id: task.id
  };
}

async function main() {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
    return;
  }

  if (command === "status") {
    const result = await request("/api/multilogin");
    console.log(
      JSON.stringify(
        {
          enabled: result.config.enabled,
          hasToken: result.config.hasToken,
          cloudBaseUrl: result.config.cloudBaseUrl,
          launcherBaseUrl: result.config.launcherBaseUrl,
          readOnlyOperations: result.safeOperations.length,
          controlOperations: result.controlOperations.length
        },
        null,
        2
      )
    );
    return;
  }

  if (command === "profiles") {
    await listProfiles(args.join(" "));
    return;
  }

  if (command === "start") {
    const [profileId, folderIdArg] = args;
    if (!profileId) throw new Error("Pass a profile_id to start.");
    const { folderId, profileType } = await resolveFolderId(profileId, folderIdArg);
    const result = await request(`/api/multilogin/profiles/${encodeURIComponent(profileId)}/start`, {
      method: "POST",
      body: JSON.stringify({ folderId, profileType })
    });
    console.log(`Started ${profileId}`);
    console.log(JSON.stringify(result.response.payload, null, 2));
    return;
  }

  if (command === "stop") {
    const [profileId] = args;
    if (!profileId) throw new Error("Pass a profile_id to stop.");
    const profileControl = await resolveFolderId(profileId, "").catch(() => ({
      folderId: "",
      profileType: args[1] === "mobile" ? "mobile" : "browser"
    }));
    const result = await request(`/api/multilogin/profiles/${encodeURIComponent(profileId)}/stop`, {
      method: "POST",
      body: JSON.stringify({ profileType: profileControl.profileType })
    });
    console.log(`Stopped ${profileId}`);
    console.log(JSON.stringify(result.response.payload, null, 2));
    return;
  }

  if (command === "open-x" || command === "install-x") {
    const [profileId] = args;
    if (!profileId) throw new Error(`Pass a profile_id to ${command}.`);
    const profile = await resolveProfile(profileId);
    const endpoint = command === "open-x" ? "open-x" : "install-x";
    const result = await request(`/api/multilogin/profiles/${encodeURIComponent(profileId)}/${endpoint}`, {
      method: "POST",
      body: JSON.stringify({
        profileType: "mobile",
        folderId: profile.folderId,
        runUiMacro: false
      })
    });
    console.log(JSON.stringify(result.response?.payload || result.response || result, null, 2));
    return;
  }

  if (command === "scroll") {
    const [profileId, count = "1"] = args;
    if (!profileId) throw new Error("Pass a profile_id to scroll.");
    const profile = await resolveProfile(profileId);
    const result = await request(`/api/multilogin/profiles/${encodeURIComponent(profileId)}/command`, {
      method: "POST",
      body: JSON.stringify({
        profileType: "mobile",
        folderId: profile.folderId,
        command: Number(count) > 1 ? "scroll_3" : "scroll_prompt"
      })
    });
    console.log(JSON.stringify(result.response?.payload || result.response || result, null, 2));
    return;
  }

  if (command === "operator") {
    const result = await request("/api/operator");
    console.log(
      JSON.stringify(
        {
          dailyOverview: result.dailyOverview,
          summary: result.summary,
          persistence: result.persistence
        },
        null,
        2
      )
    );
    if (result.sessions.length) console.table(result.sessions.slice(0, 8).map(summarizeSession));
    if (result.tasks.length) console.table(result.tasks.slice(0, 8).map(summarizeTask));
    return;
  }

  if (["work", "plan", "prepare"].includes(command)) {
    const [profileId, presetId = "review_mode"] = args;
    if (!profileId) throw new Error(`Pass a profile_id to ${command}.`);
    const profile = await resolveProfile(profileId);
    const path =
      command === "work"
        ? "/api/operator/workflows/start"
        : command === "plan"
          ? "/api/operator/plan"
          : "/api/operator/sessions";
    const result = await request(path, {
      method: "POST",
      body: JSON.stringify({
        presetId,
        profileId: profile.id,
        profileName: profile.name,
        profileType: profile.profileType || "browser",
        folderId: profile.folderId || ""
      })
    });
    if (command === "plan") {
      console.log(result.startTaskAdded ? "Queued start plus random prompts." : "Queued one random prompt.");
      console.table(result.tasks.map(summarizeTask));
    } else if (command === "work") {
      console.log(`Started work session ${result.session.id}`);
      console.table([summarizeSession(result.session)]);
    } else {
      console.log(`Prepared session ${result.session.id}`);
      console.table([summarizeSession(result.session)]);
    }
    return;
  }

  if (command === "session-start") {
    const [sessionId] = args;
    if (!sessionId) throw new Error("Pass a session_id.");
    const result = await request(`/api/operator/sessions/${encodeURIComponent(sessionId)}/start`, {
      method: "POST",
      body: "{}"
    });
    console.table([summarizeSession(result.session)]);
    return;
  }

  if (["session-done", "session-skip", "session-attention"].includes(command)) {
    const [sessionId, ...noteParts] = args;
    if (!sessionId) throw new Error("Pass a session_id.");
    const outcome = command === "session-done" ? "done" : command === "session-skip" ? "skipped" : "attention";
    const result = await request(`/api/operator/sessions/${encodeURIComponent(sessionId)}/prompt`, {
      method: "POST",
      body: JSON.stringify({
        outcome,
        notes: noteParts.join(" ")
      })
    });
    console.table([summarizeSession(result.session)]);
    return;
  }

  if (command === "session-stop") {
    const [sessionId, ...noteParts] = args;
    if (!sessionId) throw new Error("Pass a session_id.");
    const result = await request(`/api/operator/sessions/${encodeURIComponent(sessionId)}/stop`, {
      method: "POST",
      body: JSON.stringify({ notes: noteParts.join(" ") })
    });
    console.table([summarizeSession(result.session)]);
    return;
  }

  usage();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
