import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createAgent,
  createAccounts,
  createCampaign,
  generateBaselineEvents,
  getStateSnapshot,
  interactWithPost,
  loginProfile,
  logoutProfile,
  pauseAgent,
  resumeAgent,
  runProfileTask,
  seedDemoData,
  startCampaign,
  stopCampaign,
  tickRunningCampaigns,
  updateProfileBehavior,
  verifyAccount
} from "./simulator.mjs";
import {
  autoConnectAndroidPhoneControl,
  callMultiloginReadOnly,
  connectAndroidPhoneControl,
  getMultiloginMobileProfileStatuses,
  getMultiloginOverview,
  getPhoneControlStatus,
  installMultiloginMobileXApp,
  openAndroidXApp,
  openMultiloginMobileViewer,
  runAndroidAssistiveCommand,
  scrollAndroidXApp,
  searchMultiloginProfiles,
  startMultiloginProfile,
  stopMultiloginMobileProfile,
  stopMultiloginProfile
} from "./multiloginClient.mjs";
import {
  completeOperatorTask,
  createCommentDraft,
  createOperatorPlan,
  createReviewItem,
  getActiveOperatorSessionForProfile,
  getProfilesDueForAutoStop,
  prepareOperatorSession,
  createOperatorTask,
  failOperatorTask,
  getOperatorSnapshot,
  getOperatorTask,
  markOperatorTaskRunning,
  recordOperatorPromptOutcome,
  reconcileOperatorProfiles,
  startOperatorSession,
  stopOperatorSession,
  stopOperatorSessionsForProfile,
  updateCommentDraft,
  updateOperatorProfileRecord,
  updateOperatorTask,
  updateReviewItem
} from "./operatorState.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const port = Number(process.env.PORT || 5177);
let serverEnvLoaded = false;

function loadServerEnv() {
  if (serverEnvLoaded) return;
  serverEnvLoaded = true;
  const envPath = path.resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (Object.hasOwn(process.env, key)) continue;
    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }
}

function aiConfig() {
  loadServerEnv();
  return {
    enabled: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-5",
    timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || 20000)
  };
}

if (process.env.TELEPHONES_DEMO_DATA === "true") {
  seedDemoData();
}

if (process.argv.includes("--check")) {
  const snapshot = getStateSnapshot();
  console.log(
    JSON.stringify(
      {
        status: "ok",
        platforms: snapshot.platforms.length,
        profiles: snapshot.accounts.length,
        loggedInProfiles: snapshot.analytics.loggedInProfiles,
        savedItems: snapshot.savedItems.length,
        agents: snapshot.agents.length,
        events: snapshot.events.length,
        campaigns: snapshot.campaigns.length,
        demoData: process.env.TELEPHONES_DEMO_DATA === "true",
        multiloginOperations: getMultiloginOverview().safeOperations.length,
        multiloginControls: getMultiloginOverview().controlOperations.length,
        operatorFunctions: getOperatorSnapshot().functions.length
      },
      null,
      2
    )
  );
  process.exit(0);
}

setInterval(() => {
  tickRunningCampaigns();
}, 2500);

const autoStopInFlight = new Set();

async function stopProfileForRecord(record, reason) {
  const profileId = record.profileId;
  if (!profileId || autoStopInFlight.has(profileId)) return;

  autoStopInFlight.add(profileId);
  updateOperatorProfileRecord(profileId, {
    profileName: record.profileName,
    profileType: record.profileType,
    folderId: record.folderId,
    status: "stopping",
    issue: reason
  });

  try {
    if (record.profileType === "mobile") {
      await stopMultiloginMobileProfile({ profileId });
    } else {
      await stopMultiloginProfile({ profileId });
    }
    stopOperatorSessionsForProfile(profileId, {
      reason
    });
    updateOperatorProfileRecord(profileId, {
      profileName: record.profileName,
      profileType: record.profileType,
      folderId: record.folderId,
      status: "cooldown",
      issue: "",
      activeSessionId: "",
      autoStopAt: null,
      cooldownMinutes: 60,
      lastStoppedAt: new Date().toISOString()
    });
  } catch (error) {
    updateOperatorProfileRecord(profileId, {
      profileName: record.profileName,
      profileType: record.profileType,
      folderId: record.folderId,
      status: "problem",
      issue: `Auto-stop failed: ${error.message}`,
      autoStopAt: null
    });
  } finally {
    autoStopInFlight.delete(profileId);
  }
}

setInterval(() => {
  for (const record of getProfilesDueForAutoStop()) {
    stopProfileForRecord(record, "Auto-stop due after 30 minutes.");
  }
}, 15000);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, {
    error: message
  });
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function responseOutputText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const chunks = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

async function generateAiDraft(body = {}) {
  const config = aiConfig();
  if (!config.enabled) {
    throw new Error("AI draft assistant is not configured. Add OPENAI_API_KEY to .env and restart the dashboard.");
  }

  const postSummary = String(body.postSummary || "").trim().slice(0, 2800);
  const intent = String(body.intent || "").trim().slice(0, 1000);
  const mode = String(body.mode || "reply").trim();
  const tone = String(body.tone || "natural").trim();
  if (!postSummary && !intent) {
    throw new Error("Check a post or write what you want to say before asking AI.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  const prompt = [
    `Mode: ${mode}`,
    `Tone: ${tone}`,
    postSummary ? `Visible post context:\n${postSummary}` : "",
    intent ? `User intention:\n${intent}` : "",
    "Write one authentic first-person draft the user can approve before posting. Keep it concise, specific, and human. Do not invent facts. Do not include hashtags unless explicitly requested. Return only the draft text."
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const result = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: config.model,
        instructions:
          "You are an assistive writing helper for a disabled user controlling their own X/Twitter account. Help draft text only. Never claim to have posted anything. Avoid harassment, spam, impersonation, or deceptive engagement.",
        input: prompt,
        store: false
      }),
      signal: controller.signal
    });

    const payload = await result.json().catch(() => ({}));
    if (!result.ok) {
      throw new Error(payload?.error?.message || `OpenAI request failed with ${result.status}.`);
    }
    const draft = responseOutputText(payload).trim();
    if (!draft) throw new Error("AI returned an empty draft.");
    return {
      draft,
      model: config.model,
      mode,
      tone
    };
  } finally {
    clearTimeout(timeout);
  }
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath);
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function executeOperatorTask(taskId) {
  const task = markOperatorTaskRunning(taskId);
  let result = null;

  if (task.functionId === "start_profile") {
    result =
      task.profileType === "mobile"
        ? await startMobileProfileWithFallback({ profileId: task.profileId })
        : await startMultiloginProfile({ profileId: task.profileId, folderId: task.folderId });
    completeOperatorTask(task.id, { message: "Profile start requested.", request: result.request });
  } else if (task.functionId === "stop_profile") {
    result =
      task.profileType === "mobile"
        ? await stopMultiloginMobileProfile({ profileId: task.profileId })
        : await stopMultiloginProfile({ profileId: task.profileId });
    completeOperatorTask(task.id, { message: "Profile stop requested.", request: result.request });
  } else if (task.functionId === "open_x_app" && task.profileType === "mobile") {
    result = await openAndroidXApp({ profileId: task.profileId });
    completeOperatorTask(task.id, {
      message: "Android X app launch requested.",
      request: result.request
    });
  } else if (task.functionId === "scroll_prompt" && task.profileType === "mobile") {
    result = await scrollAndroidXApp({ profileId: task.profileId, count: 1 });
    completeOperatorTask(task.id, {
      message: "Android X app scroll sent.",
      request: result.request
    });
  }

  return {
    task: getOperatorTask(task.id),
    result
  };
}

async function startMobileProfileWithFallback({ profileId } = {}) {
  return openMultiloginMobileViewer({ profileId });
}

async function executeManualMobileCommand(profileId, body = {}) {
  if (body.profileType !== "mobile") {
    throw new Error("Manual phone commands are only available for mobile cloud phone profiles.");
  }

  const command = String(body.command || "scroll").trim();
  let result = null;
  let label = "";

  if (command === "open_x_app" || command === "open_x") {
    label = "Open X app";
    result = await openAndroidXApp({ profileId, adbSerial: body.adbSerial });
  } else if (command === "scroll" || command === "scroll_once" || command === "scroll_prompt") {
    label = "Scroll";
    result = await scrollAndroidXApp({ profileId, adbSerial: body.adbSerial, count: 1 });
  } else if (command === "scroll_3") {
    label = "Scroll 3x";
    result = await scrollAndroidXApp({ profileId, adbSerial: body.adbSerial, count: 3 });
  } else if (
    [
      "screenshot",
      "scroll_down",
      "scroll_up",
      "tap",
      "type_text",
      "inspect_visible",
      "open_x_profile",
      "like_visible",
      "save_visible",
      "repost_visible",
      "comment_visible",
      "key_back",
      "key_home",
      "key_enter"
    ].includes(command)
  ) {
    const labels = {
      screenshot: "Screenshot",
      scroll_down: "Scroll down",
      scroll_up: "Scroll up",
      tap: "Tap",
      type_text: "Type draft",
      inspect_visible: "Check visible post",
      open_x_profile: "Open X profile",
      like_visible: "Like visible post",
      save_visible: "Save visible post",
      repost_visible: "Repost visible post",
      comment_visible: "Comment on visible post",
      key_back: "Back",
      key_home: "Home",
      key_enter: "Enter"
    };
    label = labels[command] || "Assistive command";
    result = await runAndroidAssistiveCommand({
      profileId,
      adbSerial: body.adbSerial,
      command,
      text: body.text,
      target: body.target,
      x: body.x,
      y: body.y,
      xRatio: body.xRatio,
      yRatio: body.yRatio,
      count: body.count,
      direction: body.direction
    });
  } else {
    throw new Error(`Unsupported manual phone command: ${command}`);
  }

  const now = new Date().toISOString();
  const message = result.response?.payload?.message || `${label} command completed.`;
  const record = updateOperatorProfileRecord(profileId, {
    profileName: body.profileName,
    profileType: "mobile",
    folderId: body.folderId,
    status: "running",
    issue: "",
    lastCommandAt: now,
    lastCommand: label,
    lastCommandResult: message,
    lastSeenAt: now,
    autoStopMinutes: 30
  });

  return {
    ...result,
    command,
    commandLabel: label,
    record
  };
}

function statusPatchForMobileStatus(status, fallback = {}) {
  const mappedStatus = status?.status || "";
  const patch = {
    profileName: fallback.profileName,
    profileType: "mobile",
    folderId: fallback.folderId,
    lastSeenAt: new Date().toISOString()
  };

  if (["starting", "running", "stopping"].includes(mappedStatus)) {
    patch.status = mappedStatus;
    patch.issue = "";
    if (mappedStatus === "running" && !fallback.autoStopAt) patch.autoStopMinutes = 30;
    return patch;
  }

  if (["ready", "stopped"].includes(mappedStatus)) {
    patch.status = "ready";
    patch.issue = "";
    patch.autoStopAt = null;
    return patch;
  }

  if (mappedStatus === "error") {
    patch.status = "problem";
    patch.issue = "Multilogin reports a mobile profile error.";
    patch.autoStopAt = null;
    return patch;
  }

  return patch;
}

async function verifyMobileProfileStatus(profileId) {
  try {
    const statusResult = await getMultiloginMobileProfileStatuses([profileId]);
    return statusResult.statuses?.[profileId] || null;
  } catch (error) {
    return {
      status: "",
      rawStatus: "",
      warning: error.message
    };
  }
}

async function syncMobileProfileStatuses(profileIds = []) {
  const ids = [...new Set(profileIds.map((profileId) => String(profileId || "").trim()).filter(Boolean))];
  const result = await getMultiloginMobileProfileStatuses(ids);
  const snapshotBefore = getOperatorSnapshot();

  for (const profileId of ids) {
    const status = result.statuses?.[profileId];
    if (!status) continue;
    const record = snapshotBefore.profileRecords?.[profileId] || {};
    updateOperatorProfileRecord(profileId, statusPatchForMobileStatus(status, record));
  }

  return {
    ...result,
    snapshot: getOperatorSnapshot()
  };
}

async function handleApi(request, response, url) {
  const segments = url.pathname.split("/").filter(Boolean);
  const method = request.method;

  if (method === "GET" && url.pathname === "/api/state") {
    sendJson(response, 200, {
      ...getStateSnapshot(),
      demoData: process.env.TELEPHONES_DEMO_DATA === "true"
    });
    return;
  }

  if (method === "GET" && url.pathname === "/api/multilogin") {
    sendJson(response, 200, getMultiloginOverview());
    return;
  }

  if (method === "GET" && url.pathname === "/api/operator") {
    sendJson(response, 200, getOperatorSnapshot());
    return;
  }

  if (method === "GET" && url.pathname === "/api/ai/status") {
    const config = aiConfig();
    sendJson(response, 200, {
      enabled: config.enabled,
      model: config.model
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/ai/draft") {
    const body = await readJsonBody(request);
    sendJson(response, 200, {
      requestedAt: new Date().toISOString(),
      ...(await generateAiDraft(body))
    });
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "operator" &&
    segments[2] === "profiles" &&
    segments[4] === "state"
  ) {
    const body = await readJsonBody(request);
    const record = updateOperatorProfileRecord(segments[3], body);
    sendJson(response, 200, {
      record,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/operator/review-items") {
    const body = await readJsonBody(request);
    const item = createReviewItem(body);
    sendJson(response, 201, {
      item,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "operator" &&
    segments[2] === "review-items" &&
    segments[3]
  ) {
    const body = await readJsonBody(request);
    const item = updateReviewItem(segments[3], body);
    sendJson(response, 200, {
      item,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/operator/comment-drafts") {
    const body = await readJsonBody(request);
    const draft = createCommentDraft(body);
    sendJson(response, 201, {
      draft,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "operator" &&
    segments[2] === "comment-drafts" &&
    segments[3]
  ) {
    const body = await readJsonBody(request);
    const draft = updateCommentDraft(segments[3], body);
    sendJson(response, 200, {
      draft,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/operator/tasks") {
    const body = await readJsonBody(request);
    const task = createOperatorTask(body);
    sendJson(response, 201, {
      task,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/operator/plan") {
    const body = await readJsonBody(request);
    const plan = createOperatorPlan(body);
    sendJson(response, 201, {
      ...plan,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/operator/sessions") {
    const body = await readJsonBody(request);
    const prepared = prepareOperatorSession(body);
    sendJson(response, 201, {
      ...prepared,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/operator/workflows/start") {
    const body = await readJsonBody(request);
    let session = getActiveOperatorSessionForProfile(body.profileId);
    let startTask = null;

    if (!session) {
      const prepared = prepareOperatorSession(body);
      session = prepared.session;
      startTask = prepared.startTask;
    } else if (session.startTaskId) {
      startTask = getOperatorTask(session.startTaskId);
    }

    let startResult = null;
    let openXResult = null;
    if (startTask && ["queued", "failed"].includes(startTask.status)) {
      try {
        startResult = await executeOperatorTask(startTask.id);
      } catch (error) {
        const failedTask = failOperatorTask(startTask.id, error.message);
        sendJson(response, 400, {
          error: error.message,
          session,
          task: failedTask,
          snapshot: getOperatorSnapshot()
        });
        return;
      }
    }

    const startedSession = startOperatorSession(session.id);
    if (body.openX && startedSession.profileType === "mobile") {
      try {
        openXResult = await openAndroidXApp({ profileId: startedSession.profileId });
      } catch (error) {
        openXResult = { error: error.message };
        updateOperatorProfileRecord(startedSession.profileId, {
          profileName: startedSession.profileName,
          profileType: "mobile",
          folderId: startedSession.folderId,
          status: "running",
          issue: `X app launch failed: ${error.message}`
        });
      }
    }

    sendJson(response, 200, {
      session: startedSession,
      startTask: startResult?.task || startTask,
      startResult: startResult?.result || null,
      openXResult,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "operator" &&
    segments[2] === "sessions" &&
    segments[4] === "start"
  ) {
    const session = startOperatorSession(segments[3]);
    sendJson(response, 200, {
      session,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "operator" &&
    segments[2] === "sessions" &&
    segments[4] === "prompt"
  ) {
    const body = await readJsonBody(request);
    const session = recordOperatorPromptOutcome(segments[3], body);
    sendJson(response, 200, {
      session,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "operator" &&
    segments[2] === "sessions" &&
    segments[4] === "stop"
  ) {
    const body = await readJsonBody(request);
    const session = stopOperatorSession(segments[3], body);
    sendJson(response, 200, {
      session,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "operator" && segments[2] === "tasks" && segments[4] === "status") {
    const body = await readJsonBody(request);
    const task = updateOperatorTask(segments[3], body);
    sendJson(response, 200, {
      task,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "operator" && segments[2] === "tasks" && segments[4] === "run") {
    try {
      const { task, result } = await executeOperatorTask(segments[3]);
      sendJson(response, 200, {
        task,
        result,
        snapshot: getOperatorSnapshot()
      });
    } catch (error) {
      const existingTask = getOperatorTask(segments[3]);
      const failedTask =
        existingTask && !["completed", "cancelled"].includes(existingTask.status)
          ? failOperatorTask(existingTask.id, error.message)
          : existingTask;
      sendJson(response, 400, {
        error: error.message,
        task: failedTask,
        snapshot: getOperatorSnapshot()
      });
    }
    return;
  }

  if (method === "POST" && url.pathname === "/api/multilogin/read-only") {
    const body = await readJsonBody(request);
    const result = await callMultiloginReadOnly(body.operation);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && url.pathname === "/api/multilogin/profiles") {
    const result = await searchMultiloginProfiles({
      search: url.searchParams.get("search") || "",
      folderId: url.searchParams.get("folderId") || "",
      limit: Number(url.searchParams.get("limit") || 50),
      offset: Number(url.searchParams.get("offset") || 0)
    });
    reconcileOperatorProfiles(result.profiles || []);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && url.pathname === "/api/multilogin/mobile-statuses") {
    const ids = (url.searchParams.get("ids") || "")
      .split(",")
      .map((profileId) => profileId.trim())
      .filter(Boolean);
    const result = await syncMobileProfileStatuses(ids);
    sendJson(response, 200, result);
    return;
  }

  if (method === "GET" && url.pathname === "/api/multilogin/control-status") {
    const result = await getPhoneControlStatus();
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && url.pathname === "/api/multilogin/control-status/connect") {
    const body = await readJsonBody(request);
    const result = await connectAndroidPhoneControl(body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && url.pathname === "/api/multilogin/control-status/auto-connect") {
    const body = await readJsonBody(request);
    const result = await autoConnectAndroidPhoneControl(body);
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "multilogin" && segments[2] === "profiles" && segments[4] === "start") {
    const body = await readJsonBody(request);
    const startedAt = new Date().toISOString();
    if (body.profileType === "mobile") {
      updateOperatorProfileRecord(segments[3], {
        profileName: body.profileName,
        profileType: "mobile",
        folderId: body.folderId,
        status: "starting",
        issue: "Start requested; waiting for Multilogin confirmation.",
        lastStartedAt: startedAt,
        autoStopMinutes: 30
      });
    }
    const result =
      body.profileType === "mobile"
        ? await startMobileProfileWithFallback({ profileId: segments[3] })
        : await startMultiloginProfile({
            profileId: segments[3],
            folderId: body.folderId
          });
    const verifiedStatus = body.profileType === "mobile" ? await verifyMobileProfileStatus(segments[3]) : null;
    const record = updateOperatorProfileRecord(segments[3], {
      profileName: body.profileName,
      profileType: body.profileType || "browser",
      folderId: body.folderId,
      status: "running",
      issue:
        result.response?.payload?.startWarning || result.response?.payload?.viewerWarning || result.response?.payload?.launchWarning
          ? "Viewer opened, but Multilogin did not return a clean confirmation."
          : "",
      lastStartedAt: startedAt,
      autoStopMinutes: 30
    });
    sendJson(response, 200, {
      ...result,
      verifiedStatus,
      record,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "multilogin" &&
    segments[2] === "profiles" &&
    ["viewer", "launch"].includes(segments[4])
  ) {
    const body = await readJsonBody(request);
    if (body.profileType !== "mobile") {
      throw new Error("Viewer is only available for mobile cloud phone profiles.");
    }
    const result = await openMultiloginMobileViewer({ profileId: segments[3] });
    const verifiedStatus = await verifyMobileProfileStatus(segments[3]);
    const record = updateOperatorProfileRecord(segments[3], {
      profileName: body.profileName,
      profileType: "mobile",
      folderId: body.folderId,
      status: "running",
      issue: result.response?.payload?.launchWarning
        ? "Viewer requested, but Multilogin did not return a clean launch URL."
        : "",
      lastOpenedAt: new Date().toISOString(),
      autoStopMinutes: 30
    });
    sendJson(response, 200, {
      ...result,
      verifiedStatus,
      record,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "multilogin" &&
    segments[2] === "profiles" &&
    ["open-x", "openX", "x"].includes(segments[4])
  ) {
    const body = await readJsonBody(request);
    if (body.profileType !== "mobile") {
      throw new Error("Open X is only available for mobile cloud phone profiles.");
    }
    const result = await openAndroidXApp({ profileId: segments[3], adbSerial: body.adbSerial });
    const verifiedStatus = await verifyMobileProfileStatus(segments[3]);
    const record = updateOperatorProfileRecord(segments[3], {
      profileName: body.profileName,
      profileType: "mobile",
      folderId: body.folderId,
      status: "running",
      issue: "",
      lastCommandAt: new Date().toISOString(),
      lastCommand: "Open X app",
      lastCommandResult: result.response?.payload?.message || "Android X app launch requested.",
      autoStopMinutes: 30
    });
    sendJson(response, 200, {
      ...result,
      verifiedStatus,
      record,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "multilogin" && segments[2] === "profiles" && segments[4] === "install-x") {
    const body = await readJsonBody(request);
    if (body.profileType !== "mobile") {
      throw new Error("Install X is only available for mobile cloud phone profiles.");
    }
    const result = await installMultiloginMobileXApp({
      groupId: body.groupId || body.folderId
    });
    sendJson(response, 200, result);
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "multilogin" &&
    segments[2] === "profiles" &&
    ["command", "manual-command"].includes(segments[4])
  ) {
    const body = await readJsonBody(request);
    const result = await executeManualMobileCommand(segments[3], body);
    sendJson(response, 200, {
      ...result,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (
    method === "POST" &&
    segments[0] === "api" &&
    segments[1] === "multilogin" &&
    segments[2] === "profiles" &&
    ["stop", "shutdown"].includes(segments[4])
  ) {
    const body = await readJsonBody(request);
    const result =
      body.profileType === "mobile"
        ? await stopMultiloginMobileProfile({ profileId: segments[3] })
        : await stopMultiloginProfile({
            profileId: segments[3]
          });
    const cleanup = stopOperatorSessionsForProfile(segments[3], {
      reason: "Profile stopped from dashboard."
    });
    const verifiedStatus = body.profileType === "mobile" ? await verifyMobileProfileStatus(segments[3]) : null;
    const record = updateOperatorProfileRecord(segments[3], {
      profileName: body.profileName,
      profileType: body.profileType || "browser",
      folderId: body.folderId,
      status: "cooldown",
      issue: "",
      activeSessionId: "",
      autoStopAt: null,
      cooldownMinutes: 60,
      lastStoppedAt: new Date().toISOString()
    });
    sendJson(response, 200, {
      ...result,
      cleanup: {
        stoppedSessions: cleanup.sessions.length,
        cancelledTasks: cleanup.cancelledTasks.length
      },
      verifiedStatus,
      record,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/accounts") {
    const body = await readJsonBody(request);
    const created = createAccounts(body);
    sendJson(response, 201, {
      created,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/agents") {
    const body = await readJsonBody(request);
    const agent = createAgent(body);
    sendJson(response, 201, {
      agent,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "agents" && segments[3] === "pause") {
    const agent = pauseAgent(segments[2]);
    sendJson(response, 200, {
      agent,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "agents" && segments[3] === "resume") {
    const agent = resumeAgent(segments[2]);
    sendJson(response, 200, {
      agent,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "accounts" && segments[3] === "verify") {
    const body = await readJsonBody(request);
    const account = verifyAccount(segments[2], body.code);
    sendJson(response, 200, {
      account,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "profiles" && segments[3] === "login") {
    const account = loginProfile(segments[2]);
    sendJson(response, 200, {
      account,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "profiles" && segments[3] === "logout") {
    const account = logoutProfile(segments[2]);
    sendJson(response, 200, {
      account,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "profiles" && segments[3] === "behaviors") {
    const body = await readJsonBody(request);
    const account = updateProfileBehavior(segments[2], body.behaviorId, body);
    sendJson(response, 200, {
      account,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/profile-actions") {
    const body = await readJsonBody(request);
    const event = interactWithPost(body);
    sendJson(response, 201, {
      event,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/profile-tasks") {
    const body = await readJsonBody(request);
    const events = runProfileTask(body);
    sendJson(response, 201, {
      events,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/campaigns") {
    const body = await readJsonBody(request);
    const campaign = createCampaign(body);
    sendJson(response, 201, {
      campaign,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "campaigns" && segments[3] === "start") {
    const campaign = startCampaign(segments[2]);
    sendJson(response, 200, {
      campaign,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "campaigns" && segments[3] === "stop") {
    const campaign = stopCampaign(segments[2]);
    sendJson(response, 200, {
      campaign,
      snapshot: getStateSnapshot()
    });
    return;
  }

  if (method === "POST" && url.pathname === "/api/events/baseline") {
    const body = await readJsonBody(request);
    const events = generateBaselineEvents(body.count);
    sendJson(response, 201, {
      events,
      snapshot: getStateSnapshot()
    });
    return;
  }

  sendError(response, 404, "API route not found.");
}

async function serveStatic(request, response, url) {
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, normalizedPath);

  if (!filePath.startsWith(publicDir)) {
    sendError(response, 403, "Forbidden.");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypeFor(filePath),
      "cache-control": "no-store"
    });
    response.end(file);
  } catch {
    const file = await readFile(path.join(publicDir, "index.html"));
    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    });
    response.end(file);
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    await serveStatic(request, response, url);
  } catch (error) {
    sendError(response, 400, error.message || "Request failed.");
  }
});

server.listen(port, () => {
  console.log(`Sandbox simulator running at http://localhost:${port}`);
});
