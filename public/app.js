const $ = (selector) => document.querySelector(selector);

const nodes = {
  serverStatus: $("#serverStatus"),
  platformSelect: $("#platformSelect"),
  taskPlatformSelect: $("#taskPlatformSelect"),
  deviceSelect: $("#deviceSelect"),
  createAccountsForm: $("#createAccountsForm"),
  profileTaskForm: $("#profileTaskForm"),
  baselineButton: $("#baselineButton"),
  refreshButton: $("#refreshButton"),
  multiloginForm: $("#multiloginForm"),
  multiloginOperationSelect: $("#multiloginOperationSelect"),
  multiloginRunButton: $("#multiloginRunButton"),
  multiloginStatus: $("#multiloginStatus"),
  multiloginResult: $("#multiloginResult"),
  multiloginDocsLink: $("#multiloginDocsLink"),
  multiloginProfileSearch: $("#multiloginProfileSearch"),
  multiloginProfilesButton: $("#multiloginProfilesButton"),
  multiloginProfileList: $("#multiloginProfileList"),
  operatorSummary: $("#operatorSummary"),
  operatorTaskForm: $("#operatorTaskForm"),
  operatorAgentSelect: $("#operatorAgentSelect"),
  operatorProfileSelect: $("#operatorProfileSelect"),
  operatorFunctionSelect: $("#operatorFunctionSelect"),
  operatorTargetUrl: $("#operatorTargetUrl"),
  operatorNotes: $("#operatorNotes"),
  operatorAgents: $("#operatorAgents"),
  operatorTaskList: $("#operatorTaskList"),
  startActionsButton: $("#startActionsButton"),
  stopActionsButton: $("#stopActionsButton"),
  markActionDoneButton: $("#markActionDoneButton"),
  actionRunnerStatus: $("#actionRunnerStatus"),
  actionRunnerDetail: $("#actionRunnerDetail"),
  actionRunnerPrompt: $("#actionRunnerPrompt"),
  metricProfiles: $("#metricProfiles"),
  metricLoggedIn: $("#metricLoggedIn"),
  metricSaved: $("#metricSaved"),
  metricReview: $("#metricReview"),
  profileSummary: $("#profileSummary"),
  postQueueSummary: $("#postQueueSummary"),
  savedSummary: $("#savedSummary"),
  agentMonitorSummary: $("#agentMonitorSummary"),
  profileGrid: $("#profileGrid"),
  postQueue: $("#postQueue"),
  savedList: $("#savedList"),
  eventList: $("#eventList"),
  agentRows: $("#agentRows"),
  averageScore: $("#averageScore"),
  accountRows: $("#accountRows"),
  otpList: $("#otpList"),
  toast: $("#toast")
};

let appState = null;
let multiloginState = null;
let operatorState = null;
let multiloginProfilesState = {
  profiles: [],
  total: 0,
  loading: false,
  error: null,
  lastLoadedAt: null
};
const ACTION_RUNNER_ACTIONS = [
  {
    id: "scroll",
    label: "Scroll",
    detail: "Scroll manually for 15 seconds.",
    durationSec: 15
  },
  {
    id: "open_post",
    label: "Open post",
    detail: "Open one post manually."
  },
  {
    id: "like_review",
    label: "Review like",
    detail: "Like one post only if you choose."
  },
  {
    id: "repost_review",
    label: "Review repost",
    detail: "Repost one post only if you choose."
  },
  {
    id: "comment_draft",
    label: "Comment draft",
    detail: "Write one comment manually."
  }
];
const RANDOM_PLAN_FUNCTIONS = [
  {
    functionId: "scroll_prompt",
    notes: "Scroll manually for 15 seconds."
  },
  {
    functionId: "open_post_prompt",
    notes: "Open one post manually."
  },
  {
    functionId: "like_post_prompt",
    notes: "Review one post and like manually only if you choose."
  },
  {
    functionId: "repost_prompt",
    notes: "Review one post and repost manually only if you choose."
  },
  {
    functionId: "comment_prompt",
    notes: "Draft and post one comment manually."
  }
];
const TERMINAL_TASK_STATUSES = new Set(["completed", "cancelled"]);
let actionRunner = {
  active: false,
  timer: null,
  nextAt: null,
  current: null,
  profileId: "",
  history: []
};
let toastTimer = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Request failed.");
  return payload;
}

function showToast(message) {
  nodes.toast.textContent = message;
  nodes.toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => nodes.toast.classList.remove("visible"), 2600);
}

function platformById(platformId) {
  return appState?.platforms.find((platform) => platform.id === platformId);
}

function accountById(accountId) {
  return appState?.accounts.find((account) => account.id === accountId);
}

function postById(postId) {
  return appState?.posts.find((post) => post.id === postId);
}

function formatTime(value) {
  if (!value) return "never";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

function formatRelative(value) {
  if (!value) return "never";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 5) return "now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

function shortId(value) {
  const text = String(value || "");
  return text.length > 13 ? `${text.slice(0, 6)}...${text.slice(-4)}` : text;
}

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function fillSelect(select, items, getLabel, getValue = (item) => item.id) {
  const previous = select.value;
  select.innerHTML = items
    .map((item) => `<option value="${escapeHtml(getValue(item))}">${escapeHtml(getLabel(item))}</option>`)
    .join("");

  if (items.some((item) => getValue(item) === previous)) select.value = previous;
}

function detailForEvent(event) {
  const behavior = event.metadata?.behavior
    ? ` (${event.metadata.behavior.label}, ${event.metadata.behavior.elapsedSec}s)`
    : "";
  if (event.metadata?.text) return `${event.metadata.text}${behavior}`;
  if (event.metadata?.seconds) return `${event.metadata.seconds}s watch${behavior}`;
  if (event.action === "save") return `Saved for later review${behavior}`;
  if (event.metadata?.sourceText) return `${event.metadata.sourceText}${behavior}`;
  return `Local activity record${behavior}`;
}

function renderOptions() {
  fillSelect(nodes.platformSelect, appState.platforms, (platform) => platform.name);
  fillSelect(nodes.taskPlatformSelect, appState.platforms, (platform) => platform.name);
  fillSelect(nodes.deviceSelect, appState.deviceProfiles, (device) => `${device.label} (${device.region})`);
}

function renderMetrics() {
  const analytics = appState.analytics;
  const profiles = multiloginProfilesState.profiles;
  const readyProfiles = profiles.filter((profile) =>
    ["ready", "running", "browser_running", "active"].includes(String(profile.status || "").toLowerCase())
  ).length;
  const operatorSummary = operatorState?.summary ?? {};
  nodes.metricProfiles.textContent = multiloginProfilesState.total || analytics.totalAccounts;
  nodes.metricLoggedIn.textContent = profiles.length ? readyProfiles : analytics.loggedInProfiles;
  nodes.metricSaved.textContent = operatorSummary.totalTasks ?? analytics.savedPosts;
  nodes.metricReview.textContent = operatorSummary.runningTasks ?? analytics.flaggedAccounts;
  nodes.profileSummary.textContent = multiloginProfilesState.total
    ? `${multiloginProfilesState.total} Multilogin profile(s)`
    : `${analytics.loggedInProfiles} logged in, ${analytics.verifiedAccounts} verified`;
  nodes.postQueueSummary.textContent = `${appState.posts.length} posts`;
  nodes.savedSummary.textContent = `${appState.savedItems.length} items`;
  nodes.averageScore.textContent = `Avg ${analytics.averageDetectionScore}`;
  nodes.agentMonitorSummary.textContent = `${analytics.runningAgents} running, ${analytics.pausedAgents} paused`;
}

function renderMlxProfileCard(profile, compact = false) {
  const isMobile = profile.profileType === "mobile";
  const canStart = Boolean(profile.id && (isMobile || profile.folderId));
  const startLabel = isMobile ? "Start Bg" : "Start";
  const status = profile.status || "unknown";
  const details = [
    isMobile ? "Mobile" : "Browser",
    profile.folderName || profile.folderId,
    profile.device || profile.browserType,
    profile.osType,
    profile.serialNumber ? `Serial ${profile.serialNumber}` : ""
  ]
    .filter(Boolean)
    .join(" | ");

  return `
    <article class="${compact ? "mlx-profile compact" : "profile-card mlx-profile-card"}">
      <header>
        <div>
          <strong>${escapeHtml(profile.name || profile.id)}</strong>
          <p>${escapeHtml(details || "Multilogin profile")}</p>
        </div>
        <span class="tag ${escapeHtml(status)}">${escapeHtml(status.replaceAll("_", " "))}</span>
      </header>
      <div class="code">${escapeHtml(shortId(profile.id))}${profile.folderId ? ` | folder ${escapeHtml(shortId(profile.folderId))}` : ""}</div>
      <footer>
        <span>${profile.lastUsedAt ? `Last used ${escapeHtml(formatRelative(profile.lastUsedAt))}` : "Ready for manual control"}</span>
        <div class="button-row inline">
          <button
            class="secondary mlx-start-profile"
            data-profile-id="${escapeHtml(profile.id)}"
            data-folder-id="${escapeHtml(profile.folderId)}"
            data-profile-type="${escapeHtml(profile.profileType || "browser")}"
            ${canStart ? "" : "disabled"}
          >${startLabel}</button>
          ${
            isMobile
              ? `<button
                  class="secondary mlx-open-viewer"
                  data-profile-id="${escapeHtml(profile.id)}"
                  data-profile-type="mobile"
                >Viewer</button>`
              : ""
          }
          <button
            class="secondary mlx-stop-profile"
            data-profile-id="${escapeHtml(profile.id)}"
            data-profile-type="${escapeHtml(profile.profileType || "browser")}"
          >Stop</button>
          <button class="secondary queue-profile-review" data-profile-id="${escapeHtml(profile.id)}">Review</button>
        </div>
      </footer>
    </article>
  `;
}

function renderBehaviorCards(account) {
  return `
    <div class="behavior-grid" aria-label="Behavior recipe">
      ${account.behaviorRecipe
        .map(
          (behavior) => `
            <article class="behavior-card ${behavior.enabled ? "enabled" : "disabled"}">
              <header>
                <strong>${escapeHtml(behavior.label)}</strong>
                <label class="behavior-enabled">
                  <input
                    class="behavior-toggle"
                    type="checkbox"
                    data-account-id="${escapeHtml(account.id)}"
                    data-behavior-id="${escapeHtml(behavior.id)}"
                    ${behavior.enabled ? "checked" : ""}
                  />
                  ${behavior.enabled ? "Enabled" : "Off"}
                </label>
              </header>
              <div class="behavior-fields">
                <label>
                  Min
                  <input
                    class="behavior-field"
                    data-account-id="${escapeHtml(account.id)}"
                    data-behavior-id="${escapeHtml(behavior.id)}"
                    data-field="minSec"
                    type="number"
                    min="0"
                    max="3600"
                    value="${escapeHtml(behavior.minSec)}"
                  />
                </label>
                <label>
                  Max
                  <input
                    class="behavior-field"
                    data-account-id="${escapeHtml(account.id)}"
                    data-behavior-id="${escapeHtml(behavior.id)}"
                    data-field="maxSec"
                    type="number"
                    min="0"
                    max="3600"
                    value="${escapeHtml(behavior.maxSec)}"
                  />
                </label>
                <label>
                  Weight
                  <input
                    class="behavior-field"
                    data-account-id="${escapeHtml(account.id)}"
                    data-behavior-id="${escapeHtml(behavior.id)}"
                    data-field="weight"
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    value="${escapeHtml(behavior.weight)}"
                  />
                </label>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderProfiles() {
  if (!appState.accounts.length) {
    if (multiloginProfilesState.profiles.length) {
      nodes.profileGrid.innerHTML = multiloginProfilesState.profiles.map((profile) => renderMlxProfileCard(profile)).join("");
      return;
    }

    nodes.profileGrid.innerHTML = `<p class="empty">No local profiles. Sync Multilogin profiles to control real profiles here.</p>`;
    return;
  }

  nodes.profileGrid.innerHTML = [...appState.accounts]
    .sort((left, right) => {
      const sessionRank = { logged_in: 0, logged_out: 1, locked: 2 };
      return (sessionRank[left.sessionStatus] ?? 9) - (sessionRank[right.sessionStatus] ?? 9);
    })
    .map((account) => {
      const platform = platformById(account.platformId);
      const summary = account.summary;
      const canLogin = account.status === "verified" && account.sessionStatus !== "logged_in";
      const canLogout = account.sessionStatus === "logged_in";
      const sessionAction = canLogout
        ? `<button class="secondary profile-session" data-account-id="${escapeHtml(account.id)}" data-action="logout">Log out</button>`
        : `<button class="secondary profile-session" data-account-id="${escapeHtml(account.id)}" data-action="login" ${canLogin ? "" : "disabled"}>Log in</button>`;

      return `
        <article class="profile-card">
          <header>
            <div>
              <strong>${escapeHtml(account.handle)}</strong>
              <p>${escapeHtml(platform?.name ?? account.platformId)} | ${escapeHtml(account.id)}</p>
            </div>
            <span class="tag ${escapeHtml(account.sessionStatus)}">${escapeHtml(account.sessionStatus.replace("_", " "))}</span>
          </header>
          <div class="profile-stats">
            <span><strong>${summary.savedPosts}</strong> saved</span>
            <span><strong>${summary.comments}</strong> comments</span>
            <span><strong>${summary.reposts}</strong> reposts</span>
            <span><strong>${summary.eventsLastHour}</strong> 1h</span>
          </div>
          <div class="risk">
            <strong>${account.detection.score}</strong>
            <div class="risk-bar ${escapeHtml(account.detection.level)}">
              <span style="width: ${account.detection.score}%"></span>
            </div>
          </div>
          ${renderBehaviorCards(account)}
          <footer>
            <span>Last activity ${escapeHtml(formatRelative(summary.lastActivityAt))}</span>
            ${sessionAction}
          </footer>
        </article>
      `;
    })
    .join("");
}

function renderPostQueue() {
  const posts = [...appState.posts]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 18);

  if (!posts.length) {
    nodes.postQueue.innerHTML = `<p class="empty">No local post records.</p>`;
    return;
  }

  nodes.postQueue.innerHTML = posts
    .map((post) => {
      const author = accountById(post.authorAccountId);
      const platform = platformById(post.platformId);
      const loggedInProfiles = appState.accounts.filter(
        (account) => account.platformId === post.platformId && account.sessionStatus === "logged_in" && account.id !== post.authorAccountId
      );
      const selectOptions = loggedInProfiles
        .map((account) => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.handle)}</option>`)
        .join("");
      const disabled = loggedInProfiles.length ? "" : "disabled";

      return `
        <article class="post-item">
          <header>
            <strong>${escapeHtml(platform?.name ?? post.platformId)}</strong>
            <span>${escapeHtml(formatRelative(post.createdAt))}</span>
          </header>
          <p>${escapeHtml(post.text)}</p>
          <div class="muted-line">By ${escapeHtml(author?.handle ?? post.authorAccountId)}${post.repostOfPostId ? " | repost" : ""}</div>
          <div class="post-actions">
            <select class="post-profile-select" data-post-id="${escapeHtml(post.id)}" ${disabled}>${selectOptions}</select>
            <button class="secondary post-action" data-action="save" data-post-id="${escapeHtml(post.id)}" ${disabled}>Save</button>
            <button class="secondary post-action" data-action="comment" data-post-id="${escapeHtml(post.id)}" ${disabled}>Comment</button>
            <button class="secondary post-action" data-action="repost" data-post-id="${escapeHtml(post.id)}" ${disabled}>Repost</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSavedItems() {
  if (!appState.savedItems.length) {
    nodes.savedList.innerHTML = `<p class="empty">No saved posts or comments yet.</p>`;
    return;
  }

  nodes.savedList.innerHTML = appState.savedItems
    .map((event) => {
      const account = accountById(event.accountId);
      const post = postById(event.metadata?.sourcePostId || event.postId);
      return `
        <article class="event-item">
          <header>
            <span><span class="event-action">${escapeHtml(event.action)}</span> by ${escapeHtml(account?.handle ?? event.accountId)}</span>
            <span>${formatTime(event.createdAt)}</span>
          </header>
          <p>${escapeHtml(detailForEvent(event))}</p>
          <div class="muted-line">${escapeHtml(post?.text ?? "Post record")}</div>
        </article>
      `;
    })
    .join("");
}

function renderEvents() {
  if (!appState.events.length) {
    nodes.eventList.innerHTML = `<p class="empty">No activity yet.</p>`;
    return;
  }

  nodes.eventList.innerHTML = appState.events
    .slice(0, 24)
    .map((event) => {
      const account = accountById(event.accountId);
      const platform = platformById(event.platformId);
      return `
        <article class="event-item">
          <header>
            <span><span class="event-action">${escapeHtml(event.action)}</span> ${escapeHtml(account?.handle ?? event.accountId)}</span>
            <span>${formatTime(event.createdAt)}</span>
          </header>
          <p>${escapeHtml(platform?.name ?? event.platformId)} | ${escapeHtml(detailForEvent(event))}</p>
        </article>
      `;
    })
    .join("");
}

function renderAgents() {
  if (!appState.agents.length) {
    nodes.agentRows.innerHTML = `<p class="empty">No local agents running.</p>`;
    return;
  }

  nodes.agentRows.innerHTML = appState.agents
    .map((agent) => {
      const platform = platformById(agent.platformId);
      const summary = agent.summary;
      const action = agent.status === "paused" ? "resume" : "pause";
      const label = action === "pause" ? "Pause" : "Resume";
      return `
        <article class="agent-item">
          <header>
            <strong>${escapeHtml(agent.name)}</strong>
            <span class="tag ${escapeHtml(summary.health)}">${escapeHtml(summary.health)}</span>
          </header>
          <p>${escapeHtml(platform?.name ?? agent.platformId)} | ${summary.eventsLastHour} events / 1h | ${summary.assignedAccounts} profiles</p>
          <button class="secondary agent-status-action" data-agent-id="${escapeHtml(agent.id)}" data-action="${action}">${label}</button>
        </article>
      `;
    })
    .join("");
}

function renderAccountsTable() {
  if (!appState.accounts.length) {
    nodes.accountRows.innerHTML = `<tr><td colspan="5" class="empty">No local detection scores.</td></tr>`;
    return;
  }

  nodes.accountRows.innerHTML = [...appState.accounts]
    .sort((left, right) => right.detection.score - left.detection.score)
    .map((account) => {
      const platform = platformById(account.platformId);
      const reason = account.detection.reasons[0] ?? "Normal local behavior";
      return `
        <tr>
          <td>
            <strong>${escapeHtml(account.handle)}</strong>
            <div class="code">${escapeHtml(account.id)}</div>
          </td>
          <td>${escapeHtml(platform?.name ?? account.platformId)}</td>
          <td><span class="tag ${escapeHtml(account.sessionStatus)}">${escapeHtml(account.sessionStatus.replace("_", " "))}</span></td>
          <td>
            <div class="risk">
              <strong>${account.detection.score}</strong>
              <div class="risk-bar ${escapeHtml(account.detection.level)}">
                <span style="width: ${account.detection.score}%"></span>
              </div>
            </div>
          </td>
          <td>${escapeHtml(reason)}</td>
        </tr>
      `;
    })
    .join("");
}

function renderOtpQueue() {
  if (!appState.otpQueue.length) {
    nodes.otpList.innerHTML = `<p class="empty">No pending mock OTP codes.</p>`;
    return;
  }

  nodes.otpList.innerHTML = appState.otpQueue
    .slice(0, 10)
    .map((otp) => {
      const account = accountById(otp.accountId);
      return `
        <article class="list-item">
          <header>
            <span class="item-title">${escapeHtml(account?.handle ?? otp.accountId)}</span>
            <span class="code">${escapeHtml(otp.code)}</span>
          </header>
          <p>Expires ${formatTime(otp.expiresAt)}</p>
          <button class="secondary verify-otp" data-account-id="${escapeHtml(otp.accountId)}" data-code="${escapeHtml(otp.code)}">Verify</button>
        </article>
      `;
    })
    .join("");
}

function operatorFunctionById(functionId) {
  return operatorState?.functions.find((fn) => fn.id === functionId);
}

function operatorAgentById(agentId) {
  return operatorState?.agents.find((agent) => agent.id === agentId);
}

function multiloginProfileById(profileId) {
  return multiloginProfilesState.profiles.find((profile) => profile.id === profileId);
}

function fillOperatorProfileSelect() {
  const previous = nodes.operatorProfileSelect.value;
  const profiles = multiloginProfilesState.profiles;

  nodes.operatorProfileSelect.innerHTML = profiles.length
    ? profiles
        .map(
          (profile) =>
            `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name || profile.id)} (${escapeHtml(profile.profileType || "browser")})</option>`
        )
        .join("")
    : `<option value="">Sync profiles first</option>`;

  if (profiles.some((profile) => profile.id === previous)) nodes.operatorProfileSelect.value = previous;
}

function renderOperator() {
  if (!operatorState) return;

  fillSelect(nodes.operatorAgentSelect, operatorState.agents, (agent) => agent.name);
  fillSelect(nodes.operatorFunctionSelect, operatorState.functions, (fn) => fn.label, (fn) => fn.id);
  fillOperatorProfileSelect();

  const summary = operatorState.summary;
  nodes.operatorSummary.textContent = `${summary.queuedTasks} queued, ${summary.runningTasks} running`;
  nodes.operatorAgents.innerHTML = operatorState.agents
    .map(
      (agent) => `
        <article class="operator-agent">
          <strong>${escapeHtml(agent.name)}</strong>
          <span class="tag ${escapeHtml(agent.status)}">${escapeHtml(agent.status)}</span>
          <p>${agent.activeTasks} active | ${agent.queuedTasks} queued</p>
        </article>
      `
    )
    .join("");

  const visibleTasks = operatorState.tasks
    .filter((task) => !TERMINAL_TASK_STATUSES.has(task.status))
    .sort((left, right) => {
      const leftTime = new Date(left.scheduledFor || left.createdAt).getTime();
      const rightTime = new Date(right.scheduledFor || right.createdAt).getTime();
      return leftTime - rightTime;
    });
  if (!visibleTasks.length) {
    nodes.operatorTaskList.innerHTML = `<p class="empty">No operator tasks yet.</p>`;
    return;
  }

  nodes.operatorTaskList.innerHTML = visibleTasks
    .map((task) => {
      const agent = operatorAgentById(task.agentId);
      const fn = operatorFunctionById(task.functionId);
      const canRun = ["queued", "failed"].includes(task.status);
      const canComplete = ["queued", "running", "failed"].includes(task.status);
      return `
        <article class="operator-task">
          <header>
            <div>
              <strong>${escapeHtml(task.functionLabel)}</strong>
              <p>${escapeHtml(task.profileName)} | ${escapeHtml(agent?.name ?? task.agentId)}</p>
            </div>
            <span class="tag ${escapeHtml(task.status)}">${escapeHtml(task.status)}</span>
          </header>
          <div class="operator-task-meta">
            ${task.targetUrl ? `<span>${escapeHtml(task.targetUrl)}</span>` : ""}
            ${task.delaySec ? `<span>Delay ${escapeHtml(task.delaySec)}s</span>` : ""}
            ${task.scheduledFor ? `<span>At ${escapeHtml(formatTime(task.scheduledFor))}</span>` : ""}
            ${task.notes ? `<span>${escapeHtml(task.notes)}</span>` : ""}
            ${task.error ? `<span>${escapeHtml(task.error)}</span>` : ""}
            ${fn?.mode === "manual" && task.status === "running" ? `<span>Manual session active</span>` : ""}
          </div>
          <footer>
            <span>${escapeHtml(formatRelative(task.updatedAt))}</span>
            <div class="button-row inline">
              <button class="secondary operator-run-task" data-task-id="${escapeHtml(task.id)}" ${canRun ? "" : "disabled"}>Run</button>
              <button class="secondary operator-task-status" data-task-id="${escapeHtml(task.id)}" data-status="completed" ${canComplete ? "" : "disabled"}>Done</button>
              <button class="secondary operator-task-status" data-task-id="${escapeHtml(task.id)}" data-status="cancelled" ${["queued", "running"].includes(task.status) ? "" : "disabled"}>Cancel</button>
            </div>
          </footer>
        </article>
      `;
    })
    .join("");
}

function renderActionRunner() {
  const status = actionRunner.active ? "running" : "idle";
  const profile = multiloginProfileById(actionRunner.profileId || nodes.operatorProfileSelect.value);
  nodes.actionRunnerStatus.textContent = status;
  nodes.actionRunnerStatus.className = `tag ${status}`;
  nodes.startActionsButton.disabled = actionRunner.active || !profile;
  nodes.stopActionsButton.disabled = !actionRunner.active;
  nodes.markActionDoneButton.disabled = !actionRunner.active || !actionRunner.current;

  if (!actionRunner.active) {
    nodes.actionRunnerDetail.textContent = "Idle";
    nodes.actionRunnerPrompt.textContent = profile ? "Ready." : "Sync profiles first.";
    return;
  }

  const next = actionRunner.nextAt ? formatTime(actionRunner.nextAt) : "pending";
  nodes.actionRunnerDetail.textContent = `${profile?.name ?? "Profile"} | next ${next}`;
  nodes.actionRunnerPrompt.innerHTML = actionRunner.current
    ? `
      <strong>${escapeHtml(actionRunner.current.label)}</strong>
      <p>${escapeHtml(actionRunner.current.detail)}</p>
    `
    : `<p>Waiting for next action.</p>`;
}

function scheduleNextAction({ immediate = false } = {}) {
  clearTimeout(actionRunner.timer);
  if (!actionRunner.active) return;

  const delaySec = immediate ? 0 : randomInt(10, 230);
  actionRunner.nextAt = new Date(Date.now() + delaySec * 1000).toISOString();
  renderActionRunner();

  actionRunner.timer = setTimeout(() => {
    actionRunner.current = {
      ...pickRandom(ACTION_RUNNER_ACTIONS),
      promptedAt: new Date().toISOString()
    };
    actionRunner.nextAt = null;
    renderActionRunner();
  }, delaySec * 1000);
}

function stopActionRunner() {
  clearTimeout(actionRunner.timer);
  actionRunner = {
    active: false,
    timer: null,
    nextAt: null,
    current: null,
    profileId: "",
    history: actionRunner.history
  };
  renderActionRunner();
}

function renderMultiloginProfiles() {
  if (!nodes.multiloginProfileList) return;

  if (multiloginProfilesState.loading) {
    nodes.multiloginProfileList.innerHTML = `<p class="empty">Loading Multilogin profiles...</p>`;
    return;
  }

  if (multiloginProfilesState.error) {
    nodes.multiloginProfileList.innerHTML = `<p class="empty">${escapeHtml(multiloginProfilesState.error)}</p>`;
    return;
  }

  if (!multiloginProfilesState.profiles.length) {
    nodes.multiloginProfileList.innerHTML = `<p class="empty">No profiles synced yet.</p>`;
    return;
  }

  nodes.multiloginProfileList.innerHTML = multiloginProfilesState.profiles
    .slice(0, 8)
    .map((profile) => renderMlxProfileCard(profile, true))
    .join("");
}

function renderMultilogin() {
  if (!multiloginState) return;

  const status = multiloginState.config.enabled
    ? multiloginState.config.hasToken
      ? "Enabled"
      : "Enabled, no token"
    : "Disabled";

  nodes.multiloginStatus.textContent = status;
  nodes.multiloginStatus.classList.toggle("online", multiloginState.config.enabled);
  nodes.multiloginRunButton.disabled = !multiloginState.config.enabled;
  nodes.multiloginProfilesButton.disabled = !multiloginState.config.enabled || !multiloginState.config.hasToken;
  nodes.multiloginDocsLink.href = multiloginState.source.url;

  fillSelect(
    nodes.multiloginOperationSelect,
    multiloginState.safeOperations,
    (operation) => `${operation.label}${operation.needsToken ? " (token)" : ""}`,
    (operation) => operation.id
  );

  if (!nodes.multiloginResult.textContent.trim()) {
    nodes.multiloginResult.innerHTML = `<p>${escapeHtml(multiloginState.config.enabled ? "Ready" : "Set MULTILOGIN_ENABLED=true to enable checks.")}</p>`;
  }

  renderMultiloginProfiles();
}

function render() {
  document.querySelectorAll(".demo-only").forEach((node) => {
    node.hidden = !appState.demoData;
  });
  renderOptions();
  renderMetrics();
  renderProfiles();
  renderPostQueue();
  renderSavedItems();
  renderEvents();
  renderAgents();
  renderAccountsTable();
  renderOtpQueue();
  renderOperator();
  renderActionRunner();
  renderMultilogin();
}

async function loadState({ quiet = false } = {}) {
  try {
    const [state, multilogin, operator] = await Promise.all([api("/api/state"), api("/api/multilogin"), api("/api/operator")]);
    appState = state;
    multiloginState = multilogin;
    operatorState = operator;
    nodes.serverStatus.textContent = "Online";
    nodes.serverStatus.classList.add("online");
    render();
  } catch (error) {
    nodes.serverStatus.textContent = "Offline";
    nodes.serverStatus.classList.remove("online");
    if (!quiet) showToast(error.message);
  }
}

async function loadMultiloginProfiles({ quiet = false } = {}) {
  if (!multiloginState?.config.enabled || !multiloginState?.config.hasToken) {
    multiloginProfilesState = {
      profiles: [],
      total: 0,
      loading: false,
      error: "Enable Multilogin with a token before syncing profiles.",
      lastLoadedAt: null
    };
    render();
    return;
  }

  const query = new URLSearchParams({
    limit: "100",
    search: nodes.multiloginProfileSearch.value.trim()
  });

  multiloginProfilesState = {
    ...multiloginProfilesState,
    loading: true,
    error: null
  };
  renderMultiloginProfiles();

  try {
    const result = await api(`/api/multilogin/profiles?${query}`);
    multiloginProfilesState = {
      profiles: result.profiles,
      total: result.total,
      loading: false,
      error: null,
      lastLoadedAt: result.requestedAt
    };
    render();
    if (!quiet) showToast(`Synced ${result.profiles.length} Multilogin profile(s).`);
  } catch (error) {
    multiloginProfilesState = {
      profiles: [],
      total: 0,
      loading: false,
      error: error.message,
      lastLoadedAt: null
    };
    render();
    if (!quiet) showToast(error.message);
  }
}

async function refreshOperator() {
  operatorState = await api("/api/operator");
  render();
}

async function queueOperatorTask({ functionId, profileId, targetUrl, notes, delaySec = 0, silent = false }) {
  const profile = multiloginProfileById(profileId);
  const agent = operatorState?.agents.find((item) => item.functionIds.includes(functionId)) ?? operatorState?.agents[0];
  const scheduledFor = delaySec ? new Date(Date.now() + delaySec * 1000).toISOString() : "";
  const task = await api("/api/operator/tasks", {
    method: "POST",
    body: JSON.stringify({
      agentId: nodes.operatorAgentSelect.value || agent?.id,
      functionId,
      profileId: profile?.id || "",
      profileName: profile?.name || "",
      profileType: profile?.profileType || "browser",
      folderId: profile?.folderId || "",
      targetUrl,
      notes,
      delaySec,
      scheduledFor
    })
  });
  operatorState = task.snapshot;
  render();
  if (!silent) showToast("Operator task queued.");
  return task.task;
}

function hasStartTaskForProfile(profileId) {
  return operatorState?.tasks.some(
    (task) =>
      task.profileId === profileId &&
      task.functionId === "start_profile" &&
      !["cancelled", "failed"].includes(task.status)
  );
}

async function queueRandomPlan(profileId) {
  const profile = multiloginProfileById(profileId);
  if (!profile) throw new Error("Sync and select a profile first.");

  const queued = [];
  if (!hasStartTaskForProfile(profile.id)) {
    queued.push(
      await queueOperatorTask({
        functionId: "start_profile",
        profileId: profile.id,
        targetUrl: nodes.operatorTargetUrl.value || "https://x.com/home",
        notes: "Start once before the action plan.",
        delaySec: 0,
        silent: true
      })
    );
  }

  const planSize = randomInt(4, 7);
  let cursorSec = randomInt(10, 230);
  for (let index = 0; index < planSize; index += 1) {
    const action = pickRandom(RANDOM_PLAN_FUNCTIONS);
    queued.push(
      await queueOperatorTask({
        functionId: action.functionId,
        profileId: profile.id,
        targetUrl: nodes.operatorTargetUrl.value || "https://x.com/home",
        notes: action.notes,
        delaySec: cursorSec,
        silent: true
      })
    );
    cursorSec += randomInt(10, 230);
  }

  showToast(`Queued ${queued.length} task(s).`);
}

nodes.createAccountsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(nodes.createAccountsForm);
  try {
    const result = await api("/api/accounts", {
      method: "POST",
      body: JSON.stringify({
        platformId: formData.get("platformId"),
        deviceProfileId: formData.get("deviceProfileId"),
        count: Number(formData.get("count"))
      })
    });
    appState = result.snapshot;
    render();
    showToast(`Created ${result.created.length} profile(s).`);
  } catch (error) {
    showToast(error.message);
  }
});

nodes.profileTaskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(nodes.profileTaskForm);
  const actions = [...nodes.profileTaskForm.querySelectorAll("input[name='taskActions']:checked")].map(
    (input) => input.value
  );

  try {
    const result = await api("/api/profile-tasks", {
      method: "POST",
      body: JSON.stringify({
        platformId: formData.get("platformId"),
        count: Number(formData.get("count")),
        actions,
        commentText: formData.get("commentText")
      })
    });
    appState = result.snapshot;
    render();
    showToast(`Recorded ${result.events.length} local action(s).`);
  } catch (error) {
    showToast(error.message);
  }
});

nodes.baselineButton.addEventListener("click", async () => {
  try {
    const result = await api("/api/events/baseline", {
      method: "POST",
      body: JSON.stringify({ count: 35 })
    });
    appState = result.snapshot;
    render();
    showToast(`Generated ${result.events.length} activity records.`);
  } catch (error) {
    showToast(error.message);
  }
});

nodes.refreshButton.addEventListener("click", async () => {
  await loadState();
  if (multiloginProfilesState.lastLoadedAt) {
    await loadMultiloginProfiles({ quiet: true });
  }
});

nodes.multiloginProfilesButton.addEventListener("click", () => loadMultiloginProfiles());

nodes.multiloginProfileSearch.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    loadMultiloginProfiles();
  }
});

nodes.operatorTaskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    if (nodes.operatorFunctionSelect.value === "start_profile") {
      await queueRandomPlan(nodes.operatorProfileSelect.value);
      nodes.operatorNotes.value = "";
      return;
    }

    await queueOperatorTask({
      functionId: nodes.operatorFunctionSelect.value,
      profileId: nodes.operatorProfileSelect.value,
      targetUrl: nodes.operatorTargetUrl.value,
      notes: nodes.operatorNotes.value
    });
    nodes.operatorNotes.value = "";
  } catch (error) {
    showToast(error.message);
  }
});

nodes.startActionsButton.addEventListener("click", async () => {
  const profile = multiloginProfileById(nodes.operatorProfileSelect.value);
  if (!profile) {
    showToast("Sync and select a profile first.");
    return;
  }

  try {
    await queueOperatorTask({
      functionId: "manual_x_review",
      profileId: profile.id,
      targetUrl: nodes.operatorTargetUrl.value || "https://x.com/home",
      notes: "Action runner session"
    });
  } catch (error) {
    showToast(error.message);
  }

  actionRunner = {
    active: true,
    timer: null,
    nextAt: null,
    current: null,
    profileId: profile.id,
    history: actionRunner.history
  };
  scheduleNextAction({ immediate: true });
  showToast("Action runner started.");
});

nodes.stopActionsButton.addEventListener("click", () => {
  stopActionRunner();
  showToast("Action runner stopped.");
});

nodes.markActionDoneButton.addEventListener("click", () => {
  if (!actionRunner.current) return;
  actionRunner.history.unshift({
    ...actionRunner.current,
    doneAt: new Date().toISOString(),
    profileId: actionRunner.profileId
  });
  actionRunner.history = actionRunner.history.slice(0, 50);
  actionRunner.current = null;
  scheduleNextAction();
  showToast("Action recorded locally.");
});

nodes.multiloginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const operation = nodes.multiloginOperationSelect.value;

  try {
    nodes.multiloginResult.innerHTML = `<p>Running...</p>`;
    const result = await api("/api/multilogin/read-only", {
      method: "POST",
      body: JSON.stringify({ operation })
    });
    nodes.multiloginResult.innerHTML = `<pre>${escapeHtml(JSON.stringify(result, null, 2))}</pre>`;
    showToast("Multilogin check completed.");
  } catch (error) {
    nodes.multiloginResult.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    showToast(error.message);
  }
});

document.addEventListener("change", async (event) => {
  const toggle = event.target.closest(".behavior-toggle");
  const field = event.target.closest(".behavior-field");
  const control = toggle || field;

  if (!control) return;

  const fieldName = toggle ? "enabled" : field.dataset.field;
  const value = toggle ? toggle.checked : Number(field.value);

  try {
    const result = await api(`/api/profiles/${control.dataset.accountId}/behaviors`, {
      method: "POST",
      body: JSON.stringify({
        behaviorId: control.dataset.behaviorId,
        [fieldName]: value
      })
    });
    appState = result.snapshot;
    render();
    showToast("Behavior updated.");
  } catch (error) {
    showToast(error.message);
    render();
  }
});

document.addEventListener("click", async (event) => {
  const verifyButton = event.target.closest(".verify-otp");
  const sessionButton = event.target.closest(".profile-session");
  const postButton = event.target.closest(".post-action");
  const agentButton = event.target.closest(".agent-status-action");
  const mlxStartButton = event.target.closest(".mlx-start-profile");
  const mlxOpenViewerButton = event.target.closest(".mlx-open-viewer");
  const mlxStopButton = event.target.closest(".mlx-stop-profile");
  const queueReviewButton = event.target.closest(".queue-profile-review");
  const operatorRunButton = event.target.closest(".operator-run-task");
  const operatorStatusButton = event.target.closest(".operator-task-status");

  if (verifyButton) {
    try {
      const result = await api(`/api/accounts/${verifyButton.dataset.accountId}/verify`, {
        method: "POST",
        body: JSON.stringify({ code: verifyButton.dataset.code })
      });
      appState = result.snapshot;
      render();
      showToast("Profile verified.");
    } catch (error) {
      showToast(error.message);
    }
  }

  if (sessionButton) {
    try {
      const result = await api(`/api/profiles/${sessionButton.dataset.accountId}/${sessionButton.dataset.action}`, {
        method: "POST",
        body: "{}"
      });
      appState = result.snapshot;
      render();
      showToast(`${result.account.handle} ${sessionButton.dataset.action === "login" ? "logged in" : "logged out"}.`);
    } catch (error) {
      showToast(error.message);
    }
  }

  if (postButton) {
    const profileSelect = document.querySelector(`.post-profile-select[data-post-id="${CSS.escape(postButton.dataset.postId)}"]`);
    const text =
      postButton.dataset.action === "comment"
        ? "Saving this for later review."
        : postButton.dataset.action === "repost"
          ? "Worth revisiting later."
          : "";

    try {
      const result = await api("/api/profile-actions", {
        method: "POST",
        body: JSON.stringify({
          accountId: profileSelect?.value,
          postId: postButton.dataset.postId,
          action: postButton.dataset.action,
          text
        })
      });
      appState = result.snapshot;
      render();
      showToast(`${postButton.dataset.action} recorded.`);
    } catch (error) {
      showToast(error.message);
    }
  }

  if (agentButton) {
    try {
      const result = await api(`/api/agents/${agentButton.dataset.agentId}/${agentButton.dataset.action}`, {
        method: "POST",
        body: "{}"
      });
      appState = result.snapshot;
      render();
      showToast(`${result.agent.name} ${agentButton.dataset.action === "pause" ? "paused" : "resumed"}.`);
    } catch (error) {
      showToast(error.message);
    }
  }

  if (mlxStartButton) {
    try {
      await api(`/api/multilogin/profiles/${encodeURIComponent(mlxStartButton.dataset.profileId)}/start`, {
        method: "POST",
        body: JSON.stringify({
          folderId: mlxStartButton.dataset.folderId,
          profileType: mlxStartButton.dataset.profileType
        })
      });
      await loadMultiloginProfiles({ quiet: true });
      showToast(mlxStartButton.dataset.profileType === "mobile" ? "Started in background." : "Started Multilogin profile.");
    } catch (error) {
      showToast(error.message);
    }
  }

  if (mlxOpenViewerButton) {
    try {
      await api(`/api/multilogin/profiles/${encodeURIComponent(mlxOpenViewerButton.dataset.profileId)}/viewer`, {
        method: "POST",
        body: JSON.stringify({
          profileType: mlxOpenViewerButton.dataset.profileType
        })
      });
      await loadMultiloginProfiles({ quiet: true });
      showToast("Opened Multilogin viewer.");
    } catch (error) {
      showToast(error.message);
    }
  }

  if (mlxStopButton) {
    try {
      await api(`/api/multilogin/profiles/${encodeURIComponent(mlxStopButton.dataset.profileId)}/stop`, {
        method: "POST",
        body: JSON.stringify({
          profileType: mlxStopButton.dataset.profileType
        })
      });
      await loadMultiloginProfiles({ quiet: true });
      showToast("Stopped Multilogin profile.");
    } catch (error) {
      showToast(error.message);
    }
  }

  if (queueReviewButton) {
    try {
      await queueOperatorTask({
        functionId: "manual_x_review",
        profileId: queueReviewButton.dataset.profileId,
        targetUrl: "https://x.com/home",
        notes: "Review session"
      });
    } catch (error) {
      showToast(error.message);
    }
  }

  if (operatorRunButton) {
    try {
      const result = await api(`/api/operator/tasks/${operatorRunButton.dataset.taskId}/run`, {
        method: "POST",
        body: "{}"
      });
      operatorState = result.snapshot;
      render();
      if (result.task.functionId === "start_profile" || result.task.functionId === "stop_profile") {
        await loadMultiloginProfiles({ quiet: true });
      }
      showToast(`${result.task.functionLabel} ${result.task.status}.`);
    } catch (error) {
      await refreshOperator().catch(() => {});
      showToast(error.message);
    }
  }

  if (operatorStatusButton) {
    try {
      const result = await api(`/api/operator/tasks/${operatorStatusButton.dataset.taskId}/status`, {
        method: "POST",
        body: JSON.stringify({ status: operatorStatusButton.dataset.status })
      });
      operatorState = result.snapshot;
      render();
      showToast(`Task ${operatorStatusButton.dataset.status}.`);
    } catch (error) {
      showToast(error.message);
    }
  }
});

loadState().then(() => {
  if (multiloginState?.config.enabled && multiloginState?.config.hasToken) {
    loadMultiloginProfiles({ quiet: true });
  }
});
setInterval(() => loadState({ quiet: true }), 3000);
setInterval(() => {
  if (multiloginProfilesState.lastLoadedAt) {
    loadMultiloginProfiles({ quiet: true });
  }
}, 15000);
