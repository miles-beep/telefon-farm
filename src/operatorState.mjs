import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultStatePath = path.resolve(__dirname, "../data/operator-state.json");
const statePath = path.resolve(process.env.TELEPHONES_STATE_PATH || defaultStatePath);

const OPERATOR_FUNCTION_IDS = [
  "start_profile",
  "stop_profile",
  "manual_x_review",
  "scroll_prompt",
  "open_post_prompt",
  "save_post_prompt",
  "like_post_prompt",
  "repost_prompt",
  "comment_prompt",
  "note"
];

const STATIC_OPERATORS = [
  {
    id: "operator_profile",
    name: "Profile Operator",
    status: "idle",
    functionIds: OPERATOR_FUNCTION_IDS
  },
  {
    id: "operator_session",
    name: "Session Runner",
    status: "idle",
    functionIds: OPERATOR_FUNCTION_IDS
  },
  {
    id: "operator_review",
    name: "Review Tracker",
    status: "idle",
    functionIds: OPERATOR_FUNCTION_IDS
  }
];

const STATIC_FUNCTIONS = [
  {
    id: "start_profile",
    label: "Start profile",
    mode: "control"
  },
  {
    id: "stop_profile",
    label: "Stop profile",
    mode: "control"
  },
  {
    id: "manual_x_review",
    label: "Open review workspace",
    mode: "manual",
    defaultTargetUrl: "https://x.com/home",
    promptDetail: "Open the profile viewer and prepare for manual review."
  },
  {
    id: "scroll_prompt",
    label: "Scroll review",
    mode: "manual",
    defaultTargetUrl: "https://x.com/home",
    promptDetail: "Scroll and read manually for the scheduled review window."
  },
  {
    id: "open_post_prompt",
    label: "Open post review",
    mode: "manual",
    defaultTargetUrl: "https://x.com/home",
    promptDetail: "Open one post and decide what to do manually."
  },
  {
    id: "save_post_prompt",
    label: "Save review prompt",
    mode: "manual",
    defaultTargetUrl: "https://x.com/home",
    promptDetail: "If a post is useful, save it manually and record the result here."
  },
  {
    id: "like_post_prompt",
    label: "Like review prompt",
    mode: "manual",
    defaultTargetUrl: "https://x.com/home",
    promptDetail: "Review one post and like manually only if it is appropriate."
  },
  {
    id: "repost_prompt",
    label: "Repost review prompt",
    mode: "manual",
    defaultTargetUrl: "https://x.com/home",
    promptDetail: "Review one post and repost manually only if you choose."
  },
  {
    id: "comment_prompt",
    label: "Comment draft prompt",
    mode: "manual",
    defaultTargetUrl: "https://x.com/home",
    promptDetail: "Draft one comment manually, then mark the result here."
  },
  {
    id: "note",
    label: "Session note",
    mode: "manual",
    promptDetail: "Add a local note for this profile session."
  }
];

const STATIC_PRESETS = [
  {
    id: "review_mode",
    label: "Review mode",
    description: "Balanced manual review with save, like, repost, and comment prompts available.",
    delayMinSec: 10,
    delayMaxSec: 230,
    actionCountMin: 4,
    actionCountMax: 7,
    actions: [
      { functionId: "scroll_prompt", weight: 42 },
      { functionId: "open_post_prompt", weight: 20 },
      { functionId: "save_post_prompt", weight: 14 },
      { functionId: "like_post_prompt", weight: 10 },
      { functionId: "repost_prompt", weight: 6 },
      { functionId: "comment_prompt", weight: 8 }
    ]
  },
  {
    id: "light_warmup",
    label: "Light warmup",
    description: "Mostly scroll/open prompts with a slower cadence.",
    delayMinSec: 45,
    delayMaxSec: 180,
    actionCountMin: 3,
    actionCountMax: 5,
    actions: [
      { functionId: "scroll_prompt", weight: 70 },
      { functionId: "open_post_prompt", weight: 22 },
      { functionId: "save_post_prompt", weight: 8 }
    ]
  },
  {
    id: "comment_drafting",
    label: "Comment drafting",
    description: "Use when you want to focus on writing comments for later review.",
    delayMinSec: 35,
    delayMaxSec: 230,
    actionCountMin: 3,
    actionCountMax: 6,
    actions: [
      { functionId: "scroll_prompt", weight: 32 },
      { functionId: "open_post_prompt", weight: 28 },
      { functionId: "comment_prompt", weight: 40 }
    ]
  },
  {
    id: "no_engagement",
    label: "No engagement",
    description: "Observation-only prompts. No save, like, repost, or comment prompts.",
    delayMinSec: 30,
    delayMaxSec: 160,
    actionCountMin: 4,
    actionCountMax: 7,
    actions: [
      { functionId: "scroll_prompt", weight: 72 },
      { functionId: "open_post_prompt", weight: 28 }
    ]
  }
];

const TERMINAL_TASK_STATUSES = new Set(["completed", "failed", "cancelled"]);
const ACTIVE_SESSION_STATUSES = new Set(["prepared", "running", "needs_attention"]);

const operatorState = {
  tasks: [],
  sessions: []
};

function iso() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

function trim(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomInt(min, max) {
  const lower = Math.min(Number(min), Number(max));
  const upper = Math.max(Number(min), Number(max));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
}

function dateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function loadPersistedState() {
  if (!existsSync(statePath)) return;

  try {
    const persisted = JSON.parse(readFileSync(statePath, "utf8"));
    operatorState.tasks = Array.isArray(persisted.tasks) ? persisted.tasks.slice(0, 250) : [];
    operatorState.sessions = Array.isArray(persisted.sessions) ? persisted.sessions.slice(0, 120) : [];
  } catch (error) {
    console.warn(`Could not load operator state: ${error.message}`);
  }
}

function savePersistedState() {
  try {
    mkdirSync(path.dirname(statePath), { recursive: true });
    writeFileSync(
      statePath,
      JSON.stringify(
        {
          version: 1,
          savedAt: iso(),
          tasks: operatorState.tasks,
          sessions: operatorState.sessions
        },
        null,
        2
      )
    );
  } catch (error) {
    console.warn(`Could not save operator state: ${error.message}`);
  }
}

loadPersistedState();

function getOperatorsWithStatus() {
  const runningTasks = operatorState.tasks.filter((task) => task.status === "running");
  const queuedTasks = operatorState.tasks.filter((task) => task.status === "queued");

  return STATIC_OPERATORS.map((operator) => {
    const activeTasks = runningTasks.filter((task) => task.agentId === operator.id).length;
    const queued = queuedTasks.filter((task) => task.agentId === operator.id).length;
    return {
      ...operator,
      status: activeTasks ? "running" : queued ? "queued" : "idle",
      activeTasks,
      queuedTasks: queued
    };
  });
}

function getOperator(operatorId) {
  return STATIC_OPERATORS.find((operator) => operator.id === operatorId) ?? STATIC_OPERATORS[0];
}

function getFunction(functionId) {
  return STATIC_FUNCTIONS.find((fn) => fn.id === functionId);
}

function getPreset(presetId) {
  return STATIC_PRESETS.find((preset) => preset.id === presetId) ?? STATIC_PRESETS[0];
}

function pickWeightedAction(preset) {
  const total = preset.actions.reduce((sum, action) => sum + Number(action.weight || 0), 0);
  let cursor = Math.random() * total;

  for (const action of preset.actions) {
    cursor -= Number(action.weight || 0);
    if (cursor <= 0) return action;
  }

  return preset.actions[0];
}

function findReusableStartTask(profileId) {
  const now = Date.now();
  const recentCutoff = now - 6 * 60 * 60 * 1000;
  return operatorState.tasks.find((task) => {
    if (task.profileId !== profileId || task.functionId !== "start_profile") return false;
    if (["queued", "running"].includes(task.status)) return true;
    if (task.status !== "completed") return false;
    return new Date(task.updatedAt || task.completedAt || 0).getTime() > recentCutoff;
  });
}

function taskPayloadForProfile(payload) {
  return {
    profileId: trim(payload.profileId),
    profileName: trim(payload.profileName, "No profile selected"),
    profileType: trim(payload.profileType, "browser"),
    folderId: trim(payload.folderId)
  };
}

function createTaskRecord(payload = {}) {
  const fn = getFunction(payload.functionId);
  if (!fn) throw new Error("Select a valid operator function.");

  const operator = getOperator(payload.agentId || payload.operatorId);
  if (!operator.functionIds.includes(fn.id)) {
    throw new Error(`${operator.name} cannot run ${fn.label}.`);
  }

  const profile = taskPayloadForProfile(payload);
  if (fn.id !== "note" && !profile.profileId) {
    throw new Error("Select a profile for this task.");
  }

  const now = iso();
  return {
    id: id("task"),
    agentId: operator.id,
    operatorId: operator.id,
    functionId: fn.id,
    functionLabel: fn.label,
    mode: fn.mode,
    status: "queued",
    profileId: profile.profileId,
    profileName: profile.profileName,
    profileType: profile.profileType,
    folderId: profile.folderId,
    targetUrl: trim(payload.targetUrl, fn.defaultTargetUrl || ""),
    notes: trim(payload.notes),
    delaySec: Number.isFinite(Number(payload.delaySec)) ? Math.max(0, Math.round(Number(payload.delaySec))) : 0,
    scheduledFor: trim(payload.scheduledFor),
    sessionId: trim(payload.sessionId),
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null,
    result: null,
    error: null
  };
}

function addTask(task) {
  operatorState.tasks.unshift(task);
  operatorState.tasks = operatorState.tasks.slice(0, 250);
  savePersistedState();
  return task;
}

function buildPromptFromAction({ preset, action, session, immediate = false }) {
  const fn = getFunction(action.functionId);
  const delaySec = immediate ? 0 : randomInt(preset.delayMinSec, preset.delayMaxSec);
  return {
    id: id("prompt"),
    functionId: fn.id,
    label: fn.label,
    detail: fn.promptDetail || "Complete this local prompt manually.",
    targetUrl: session.targetUrl || fn.defaultTargetUrl || "",
    notes: "",
    delaySec,
    scheduledFor: new Date(Date.now() + delaySec * 1000).toISOString(),
    createdAt: iso()
  };
}

function scheduleNextPrompt(session, { immediate = false } = {}) {
  const preset = getPreset(session.presetId);
  const action = pickWeightedAction(preset);
  session.currentPrompt = buildPromptFromAction({ preset, action, session, immediate });
  session.nextPromptAt = session.currentPrompt.scheduledFor;
  session.updatedAt = iso();
  return session.currentPrompt;
}

function sessionWarningsFor(payload = {}) {
  const warnings = [];
  const profileId = trim(payload.profileId);
  const today = dateKey();
  const previousToday = operatorState.sessions.find(
    (session) =>
      session.profileId === profileId &&
      dateKey(session.startedAt || session.createdAt) === today &&
      !ACTIVE_SESSION_STATUSES.has(session.status)
  );
  const failedStart = operatorState.tasks.find(
    (task) => task.profileId === profileId && task.functionId === "start_profile" && task.status === "failed"
  );

  if (previousToday) {
    warnings.push("This profile already had a session today.");
  }
  if (failedStart) {
    warnings.push("The last profile start task failed. Open Viewer if background start is not available.");
  }
  if (trim(payload.profileType) === "mobile") {
    warnings.push("Mobile profiles can run in background; use Viewer only when you need to watch the phone.");
  }
  warnings.push("Third-party website actions stay manual; this dashboard records prompts and outcomes.");
  return warnings;
}

function getDailyOverview() {
  const today = dateKey();
  const todaySessions = operatorState.sessions.filter((session) => dateKey(session.startedAt || session.createdAt) === today);
  const todayEvents = operatorState.sessions.flatMap((session) =>
    (session.events || []).filter((event) => dateKey(event.createdAt) === today).map((event) => ({ ...event, sessionId: event.sessionId || session.id }))
  );
  const todayTasks = operatorState.tasks.filter((task) => dateKey(task.updatedAt || task.createdAt) === today);
  const attentionSessionIds = new Set([
    ...todayEvents.filter((event) => event.outcome === "attention").map((event) => event.sessionId),
    ...operatorState.sessions.filter((session) => session.status === "needs_attention").map((session) => session.id)
  ]);

  return {
    date: today,
    profilesUsedToday: new Set(todaySessions.map((session) => session.profileId).filter(Boolean)).size,
    activeSessions: operatorState.sessions.filter((session) => ACTIVE_SESSION_STATUSES.has(session.status)).length,
    completedPrompts: todayEvents.filter((event) => event.outcome === "done").length,
    skippedPrompts: todayEvents.filter((event) => event.outcome === "skipped").length,
    attentionItems: attentionSessionIds.size,
    queuedTasks: operatorState.tasks.filter((task) => task.status === "queued").length,
    runningTasks: operatorState.tasks.filter((task) => task.status === "running").length,
    failedTasks: todayTasks.filter((task) => task.status === "failed").length
  };
}

export function getOperatorSnapshot() {
  const runningTasks = operatorState.tasks.filter((task) => task.status === "running");
  const queuedTasks = operatorState.tasks.filter((task) => task.status === "queued");
  const operators = getOperatorsWithStatus();
  const sessions = [...operatorState.sessions].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));

  return {
    generatedAt: iso(),
    operators,
    agents: operators,
    functions: clone(STATIC_FUNCTIONS),
    presets: clone(STATIC_PRESETS),
    tasks: [...operatorState.tasks].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)),
    sessions,
    activeSession: sessions.find((session) => ACTIVE_SESSION_STATUSES.has(session.status)) || null,
    dailyOverview: getDailyOverview(),
    persistence: {
      enabled: true,
      path: statePath
    },
    summary: {
      totalTasks: operatorState.tasks.length,
      queuedTasks: queuedTasks.length,
      runningTasks: runningTasks.length,
      completedTasks: operatorState.tasks.filter((task) => task.status === "completed").length,
      failedTasks: operatorState.tasks.filter((task) => task.status === "failed").length,
      activeSessions: operatorState.sessions.filter((session) => ACTIVE_SESSION_STATUSES.has(session.status)).length
    }
  };
}

export function getOperatorTask(taskId) {
  return operatorState.tasks.find((task) => task.id === taskId);
}

export function createOperatorTask(payload = {}) {
  const profileId = trim(payload.profileId);
  if (payload.functionId === "start_profile") {
    const existingStartTask = findReusableStartTask(profileId);
    if (existingStartTask) return existingStartTask;
  }

  return addTask(createTaskRecord(payload));
}

export function createOperatorPlan(payload = {}) {
  const profile = taskPayloadForProfile(payload);
  if (!profile.profileId) throw new Error("Select a profile before planning tasks.");

  const preset = getPreset(payload.presetId);
  const operator = getOperator(payload.agentId || payload.operatorId);
  const targetUrl = trim(payload.targetUrl, "https://x.com/home");
  const notes = trim(payload.notes);
  const tasks = [];
  let startTaskAdded = false;

  const reusableStartTask = findReusableStartTask(profile.profileId);
  if (!reusableStartTask) {
    tasks.push(
      createOperatorTask({
        ...profile,
        agentId: operator.id,
        functionId: "start_profile",
        targetUrl,
        notes: "One-time profile start before the planned prompts."
      })
    );
    startTaskAdded = true;
  }

  const count = startTaskAdded ? randomInt(preset.actionCountMin, preset.actionCountMax) : 1;
  let cursorSec = randomInt(preset.delayMinSec, preset.delayMaxSec);
  for (let index = 0; index < count; index += 1) {
    const action = pickWeightedAction(preset);
    const fn = getFunction(action.functionId);
    tasks.push(
      createOperatorTask({
        ...profile,
        agentId: operator.id,
        functionId: fn.id,
        targetUrl: targetUrl || fn.defaultTargetUrl,
        notes: notes || fn.promptDetail || "",
        delaySec: cursorSec,
        scheduledFor: new Date(Date.now() + cursorSec * 1000).toISOString()
      })
    );
    cursorSec += randomInt(preset.delayMinSec, preset.delayMaxSec);
  }

  return {
    preset,
    startTaskAdded,
    tasks
  };
}

export function updateOperatorTask(taskId, patch = {}) {
  const task = getOperatorTask(taskId);
  if (!task) throw new Error("Operator task not found.");

  const allowedStatus = ["queued", "running", "completed", "failed", "cancelled"];
  if (patch.status && !allowedStatus.includes(patch.status)) {
    throw new Error("Invalid task status.");
  }

  if (patch.status) {
    task.status = patch.status;
    if (patch.status === "running" && !task.startedAt) task.startedAt = iso();
    if (TERMINAL_TASK_STATUSES.has(patch.status) || patch.status === "completed") task.completedAt = iso();
  }

  if (Object.hasOwn(patch, "notes")) task.notes = trim(patch.notes);
  if (Object.hasOwn(patch, "result")) task.result = patch.result;
  if (Object.hasOwn(patch, "error")) task.error = patch.error;
  task.updatedAt = iso();
  savePersistedState();
  return task;
}

export function markOperatorTaskRunning(taskId) {
  const task = getOperatorTask(taskId);
  if (!task) throw new Error("Operator task not found.");
  if (["completed", "cancelled"].includes(task.status)) {
    throw new Error("Completed or cancelled tasks cannot be run again.");
  }
  return updateOperatorTask(taskId, { status: "running" });
}

export function completeOperatorTask(taskId, result = null) {
  return updateOperatorTask(taskId, { status: "completed", result, error: null });
}

export function failOperatorTask(taskId, error) {
  return updateOperatorTask(taskId, { status: "failed", error: String(error || "Task failed.") });
}

export function getOperatorSession(sessionId) {
  return operatorState.sessions.find((session) => session.id === sessionId);
}

export function getActiveOperatorSessionForProfile(profileId) {
  const normalizedProfileId = trim(profileId);
  return operatorState.sessions.find(
    (session) => session.profileId === normalizedProfileId && ACTIVE_SESSION_STATUSES.has(session.status)
  );
}

export function prepareOperatorSession(payload = {}) {
  const profile = taskPayloadForProfile(payload);
  if (!profile.profileId) throw new Error("Select a profile before preparing a session.");

  const existing = getActiveOperatorSessionForProfile(profile.profileId);
  if (existing) {
    throw new Error("This profile already has an active session. Stop it before preparing another one.");
  }

  const preset = getPreset(payload.presetId);
  const operator = getOperator(payload.agentId || payload.operatorId);
  const now = iso();
  const session = {
    id: id("session"),
    operatorId: operator.id,
    operatorName: operator.name,
    profileId: profile.profileId,
    profileName: profile.profileName,
    profileType: profile.profileType,
    folderId: profile.folderId,
    presetId: preset.id,
    presetLabel: preset.label,
    targetUrl: trim(payload.targetUrl, "https://x.com/home"),
    notes: trim(payload.notes),
    status: "prepared",
    warnings: sessionWarningsFor(payload),
    startTaskId: "",
    currentPrompt: null,
    nextPromptAt: null,
    events: [],
    createdAt: now,
    startedAt: null,
    stoppedAt: null,
    updatedAt: now
  };

  const startTask = createOperatorTask({
    ...profile,
    agentId: operator.id,
    functionId: "start_profile",
    targetUrl: session.targetUrl,
    notes: "Prepare profile for this session.",
    sessionId: session.id
  });
  session.startTaskId = startTask.id;

  operatorState.sessions.unshift(session);
  operatorState.sessions = operatorState.sessions.slice(0, 120);
  savePersistedState();
  return {
    session,
    startTask
  };
}

export function startOperatorSession(sessionId) {
  const session = getOperatorSession(sessionId);
  if (!session) throw new Error("Session not found.");
  if (session.status === "stopped") throw new Error("This session is already stopped.");

  session.status = "running";
  if (!session.startedAt) session.startedAt = iso();
  if (!session.currentPrompt) scheduleNextPrompt(session, { immediate: true });
  session.updatedAt = iso();
  savePersistedState();
  return session;
}

export function recordOperatorPromptOutcome(sessionId, payload = {}) {
  const session = getOperatorSession(sessionId);
  if (!session) throw new Error("Session not found.");
  if (session.status === "stopped") throw new Error("This session is stopped.");
  if (!session.currentPrompt) throw new Error("No active prompt to record.");

  const outcome = trim(payload.outcome);
  if (!["done", "skipped", "attention"].includes(outcome)) {
    throw new Error("Use done, skipped, or attention.");
  }

  const now = iso();
  session.events.unshift({
    id: id("event"),
    sessionId: session.id,
    promptId: session.currentPrompt.id,
    functionId: session.currentPrompt.functionId,
    label: session.currentPrompt.label,
    outcome,
    notes: trim(payload.notes),
    targetUrl: session.currentPrompt.targetUrl,
    scheduledFor: session.currentPrompt.scheduledFor,
    createdAt: now
  });
  session.events = session.events.slice(0, 80);
  session.currentPrompt = null;
  session.nextPromptAt = null;
  session.updatedAt = now;

  if (outcome === "attention") {
    session.status = "needs_attention";
  } else {
    session.status = "running";
    scheduleNextPrompt(session);
  }

  savePersistedState();
  return session;
}

export function stopOperatorSession(sessionId, payload = {}) {
  const session = getOperatorSession(sessionId);
  if (!session) throw new Error("Session not found.");

  const now = iso();
  if (trim(payload.notes)) {
    session.events.unshift({
      id: id("event"),
      sessionId: session.id,
      label: "Session stopped",
      functionId: "note",
      outcome: "stopped",
      notes: trim(payload.notes),
      targetUrl: session.targetUrl,
      scheduledFor: "",
      createdAt: now
    });
  }

  session.status = "stopped";
  session.currentPrompt = null;
  session.nextPromptAt = null;
  session.stoppedAt = now;
  session.updatedAt = now;
  savePersistedState();
  return session;
}
