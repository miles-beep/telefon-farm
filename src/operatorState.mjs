import { randomUUID } from "node:crypto";

const operatorState = {
  agents: [
    {
      id: "agent_profile_operator",
      name: "Profile Operator",
      status: "idle",
      functionIds: [
        "start_profile",
        "stop_profile",
        "manual_x_review",
        "scroll_prompt",
        "open_post_prompt",
        "like_post_prompt",
        "repost_prompt",
        "comment_prompt",
        "note"
      ]
    },
    {
      id: "agent_review_tracker",
      name: "Review Tracker",
      status: "idle",
      functionIds: [
        "start_profile",
        "stop_profile",
        "manual_x_review",
        "scroll_prompt",
        "open_post_prompt",
        "like_post_prompt",
        "repost_prompt",
        "comment_prompt",
        "note"
      ]
    }
  ],
  functions: [
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
      label: "Manual X review",
      mode: "manual",
      defaultTargetUrl: "https://x.com/home"
    },
    {
      id: "scroll_prompt",
      label: "Scroll prompt",
      mode: "manual",
      defaultTargetUrl: "https://x.com/home"
    },
    {
      id: "open_post_prompt",
      label: "Open post prompt",
      mode: "manual",
      defaultTargetUrl: "https://x.com/home"
    },
    {
      id: "like_post_prompt",
      label: "Like review prompt",
      mode: "manual",
      defaultTargetUrl: "https://x.com/home"
    },
    {
      id: "repost_prompt",
      label: "Repost review prompt",
      mode: "manual",
      defaultTargetUrl: "https://x.com/home"
    },
    {
      id: "comment_prompt",
      label: "Comment draft prompt",
      mode: "manual",
      defaultTargetUrl: "https://x.com/home"
    },
    {
      id: "note",
      label: "Session note",
      mode: "manual"
    }
  ],
  tasks: []
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

export function getOperatorSnapshot() {
  const activeTasks = operatorState.tasks.filter((task) => task.status === "running");
  const queuedTasks = operatorState.tasks.filter((task) => task.status === "queued");

  return {
    generatedAt: iso(),
    agents: operatorState.agents.map((agent) => ({
      ...agent,
      activeTasks: activeTasks.filter((task) => task.agentId === agent.id).length,
      queuedTasks: queuedTasks.filter((task) => task.agentId === agent.id).length
    })),
    functions: operatorState.functions,
    tasks: [...operatorState.tasks].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)),
    summary: {
      totalTasks: operatorState.tasks.length,
      queuedTasks: queuedTasks.length,
      runningTasks: activeTasks.length,
      completedTasks: operatorState.tasks.filter((task) => task.status === "completed").length,
      failedTasks: operatorState.tasks.filter((task) => task.status === "failed").length
    }
  };
}

export function getOperatorTask(taskId) {
  return operatorState.tasks.find((task) => task.id === taskId);
}

export function createOperatorTask(payload = {}) {
  const fn = operatorState.functions.find((item) => item.id === payload.functionId);
  if (!fn) throw new Error("Select a valid operator function.");

  const agent = operatorState.agents.find((item) => item.id === payload.agentId) ?? operatorState.agents[0];
  if (!agent.functionIds.includes(fn.id)) {
    throw new Error(`${agent.name} cannot run ${fn.label}.`);
  }

  if (fn.id !== "note" && !trim(payload.profileId)) {
    throw new Error("Select a profile for this task.");
  }

  const now = iso();
  const task = {
    id: id("task"),
    agentId: agent.id,
    functionId: fn.id,
    functionLabel: fn.label,
    mode: fn.mode,
    status: "queued",
    profileId: trim(payload.profileId),
    profileName: trim(payload.profileName, "No profile selected"),
    profileType: trim(payload.profileType, "browser"),
    folderId: trim(payload.folderId),
    targetUrl: trim(payload.targetUrl, fn.defaultTargetUrl || ""),
    notes: trim(payload.notes),
    delaySec: Number.isFinite(Number(payload.delaySec)) ? Math.max(0, Math.round(Number(payload.delaySec))) : 0,
    scheduledFor: trim(payload.scheduledFor),
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null,
    result: null,
    error: null
  };

  operatorState.tasks.unshift(task);
  operatorState.tasks = operatorState.tasks.slice(0, 100);
  return task;
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
    if (["completed", "failed", "cancelled"].includes(patch.status)) task.completedAt = iso();
  }

  if (Object.hasOwn(patch, "notes")) task.notes = trim(patch.notes);
  if (Object.hasOwn(patch, "result")) task.result = patch.result;
  if (Object.hasOwn(patch, "error")) task.error = patch.error;
  task.updatedAt = iso();
  updateAgentStatus(task.agentId);
  return task;
}

export function markOperatorTaskRunning(taskId) {
  return updateOperatorTask(taskId, { status: "running" });
}

export function completeOperatorTask(taskId, result = null) {
  return updateOperatorTask(taskId, { status: "completed", result, error: null });
}

export function failOperatorTask(taskId, error) {
  return updateOperatorTask(taskId, { status: "failed", error: String(error || "Task failed.") });
}

function updateAgentStatus(agentId) {
  const agent = operatorState.agents.find((item) => item.id === agentId);
  if (!agent) return;
  const active = operatorState.tasks.some((task) => task.agentId === agentId && task.status === "running");
  const queued = operatorState.tasks.some((task) => task.agentId === agentId && task.status === "queued");
  agent.status = active ? "running" : queued ? "queued" : "idle";
}
