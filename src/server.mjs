import { createServer } from "node:http";
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
  callMultiloginReadOnly,
  getMultiloginOverview,
  installMultiloginMobileXApp,
  openMultiloginMobileViewer,
  openMultiloginMobileX,
  searchMultiloginProfiles,
  startMultiloginMobileProfile,
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
  startOperatorSession,
  stopOperatorSession,
  updateCommentDraft,
  updateOperatorProfileRecord,
  updateOperatorTask,
  updateReviewItem
} from "./operatorState.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const port = Number(process.env.PORT || 5177);

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
        ? await startMultiloginMobileProfile({ profileId: task.profileId })
        : await startMultiloginProfile({ profileId: task.profileId, folderId: task.folderId });
    completeOperatorTask(task.id, { message: "Profile start requested.", request: result.request });
  } else if (task.functionId === "stop_profile") {
    result =
      task.profileType === "mobile"
        ? await stopMultiloginMobileProfile({ profileId: task.profileId })
        : await stopMultiloginProfile({ profileId: task.profileId });
    completeOperatorTask(task.id, { message: "Profile stop requested.", request: result.request });
  }

  return {
    task: getOperatorTask(task.id),
    result
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
      openXResult = await openMultiloginMobileX({
        profileId: startedSession.profileId,
        groupId: body.groupId || body.folderId || startedSession.folderId,
        ensureInstalled: body.ensureXInstalled === true,
        runUiMacro: body.runUiMacro !== false
      });
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
    sendJson(response, 200, result);
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "multilogin" && segments[2] === "profiles" && segments[4] === "start") {
    const body = await readJsonBody(request);
    const result =
      body.profileType === "mobile"
        ? await startMultiloginMobileProfile({ profileId: segments[3] })
        : await startMultiloginProfile({
            profileId: segments[3],
            folderId: body.folderId
          });
    const record = updateOperatorProfileRecord(segments[3], {
      profileName: body.profileName,
      profileType: body.profileType || "browser",
      folderId: body.folderId,
      status: "running",
      issue: "",
      lastStartedAt: new Date().toISOString(),
      autoStopMinutes: 30
    });
    sendJson(response, 200, {
      ...result,
      record,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "multilogin" && segments[2] === "profiles" && segments[4] === "viewer") {
    const body = await readJsonBody(request);
    if (body.profileType !== "mobile") {
      throw new Error("Viewer is only available for mobile cloud phone profiles.");
    }
    const result = await openMultiloginMobileViewer({ profileId: segments[3] });
    const record = updateOperatorProfileRecord(segments[3], {
      profileName: body.profileName,
      profileType: "mobile",
      folderId: body.folderId,
      status: "running",
      issue: "",
      lastOpenedAt: new Date().toISOString(),
      autoStopMinutes: 30
    });
    sendJson(response, 200, {
      ...result,
      record,
      snapshot: getOperatorSnapshot()
    });
    return;
  }

  if (method === "POST" && segments[0] === "api" && segments[1] === "multilogin" && segments[2] === "profiles" && segments[4] === "open-x") {
    const body = await readJsonBody(request);
    if (body.profileType !== "mobile") {
      throw new Error("Open X is only available for mobile cloud phone profiles.");
    }
    const result = await openMultiloginMobileX({
      profileId: segments[3],
      groupId: body.groupId || body.folderId,
      ensureInstalled: body.ensureInstalled === true,
      runUiMacro: body.runUiMacro !== false
    });
    const record = updateOperatorProfileRecord(segments[3], {
      profileName: body.profileName,
      profileType: "mobile",
      folderId: body.folderId,
      status: "running",
      issue: result.response?.payload?.macroWarning || result.response?.payload?.installWarning || "",
      lastOpenedAt: new Date().toISOString(),
      autoStopMinutes: 30
    });
    sendJson(response, 200, {
      ...result,
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

  if (method === "POST" && segments[0] === "api" && segments[1] === "multilogin" && segments[2] === "profiles" && segments[4] === "stop") {
    const body = await readJsonBody(request);
    const result =
      body.profileType === "mobile"
        ? await stopMultiloginMobileProfile({ profileId: segments[3] })
        : await stopMultiloginProfile({
            profileId: segments[3]
          });
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
