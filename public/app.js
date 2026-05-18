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
  prioritySummary: $("#prioritySummary"),
  priorityBoard: $("#priorityBoard"),
  operatorSummary: $("#operatorSummary"),
  operatorTaskForm: $("#operatorTaskForm"),
  operatorAgentSelect: $("#operatorAgentSelect"),
  operatorProfileSelect: $("#operatorProfileSelect"),
  operatorFunctionSelect: $("#operatorFunctionSelect"),
  operatorTargetUrl: $("#operatorTargetUrl"),
  operatorNotes: $("#operatorNotes"),
  operatorAgents: $("#operatorAgents"),
  operatorTaskList: $("#operatorTaskList"),
  sessionSummary: $("#sessionSummary"),
  sessionProfileSelect: $("#sessionProfileSelect"),
  sessionPresetSelect: $("#sessionPresetSelect"),
  sessionTargetUrl: $("#sessionTargetUrl"),
  sessionNotes: $("#sessionNotes"),
  openNextProfileButton: $("#openNextProfileButton"),
  cooldownProfileButton: $("#cooldownProfileButton"),
  clearProfileIssueButton: $("#clearProfileIssueButton"),
  startWorkButton: $("#startWorkButton"),
  prepareSessionButton: $("#prepareSessionButton"),
  runSessionStartTaskButton: $("#runSessionStartTaskButton"),
  startSessionButton: $("#startSessionButton"),
  openSessionViewerButton: $("#openSessionViewerButton"),
  openSessionXButton: $("#openSessionXButton"),
  installSessionXButton: $("#installSessionXButton"),
  stopSessionButton: $("#stopSessionButton"),
  sessionStatusTitle: $("#sessionStatusTitle"),
  sessionStatusDetail: $("#sessionStatusDetail"),
  sessionStatusTag: $("#sessionStatusTag"),
  sessionSafetyList: $("#sessionSafetyList"),
  sessionPromptCard: $("#sessionPromptCard"),
  sessionPromptDoneButton: $("#sessionPromptDoneButton"),
  sessionPromptSkipButton: $("#sessionPromptSkipButton"),
  sessionPromptAttentionButton: $("#sessionPromptAttentionButton"),
  sessionLog: $("#sessionLog"),
  dailyProfiles: $("#dailyProfiles"),
  dailyActive: $("#dailyActive"),
  dailyDone: $("#dailyDone"),
  dailyAttention: $("#dailyAttention"),
  liveAgentSummary: $("#liveAgentSummary"),
  phoneControlPanel: $("#phoneControlPanel"),
  assistiveController: $("#assistiveController"),
  liveAgentBoard: $("#liveAgentBoard"),
  sessionOverview: $("#sessionOverview"),
  profileBucketSummary: $("#profileBucketSummary"),
  profileBuckets: $("#profileBuckets"),
  reviewQueueSummary: $("#reviewQueueSummary"),
  reviewItemForm: $("#reviewItemForm"),
  reviewItemUrl: $("#reviewItemUrl"),
  reviewItemNote: $("#reviewItemNote"),
  reviewQueueList: $("#reviewQueueList"),
  commentDraftSummary: $("#commentDraftSummary"),
  commentDraftForm: $("#commentDraftForm"),
  commentDraftLabel: $("#commentDraftLabel"),
  commentDraftText: $("#commentDraftText"),
  commentDraftList: $("#commentDraftList"),
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
let phoneControlState = null;
let assistiveLastReport = null;
let multiloginProfilesState = {
  profiles: [],
  total: 0,
  loading: false,
  error: null,
  lastLoadedAt: null
};
const TERMINAL_TASK_STATUSES = new Set(["completed", "cancelled"]);
const ACTIVE_PROFILE_STATUSES = new Set(["starting", "running", "stopping", "prepared"]);
const ACTIVE_SESSION_STATUSES = new Set(["prepared", "running", "needs_attention"]);
let queuePlanInFlight = false;
let toastTimer = null;
let liveStatusState = {
  checking: false,
  lastCheckedAt: null,
  error: ""
};
const PROFILE_BUCKETS = [
  { id: "ready", label: "Ready" },
  { id: "active", label: "Active" },
  { id: "cooldown", label: "Cooldown" },
  { id: "setup", label: "Setup" },
  { id: "attention", label: "Attention" }
];
const PRIORITY_ORDER = {
  running: 0,
  starting: 1,
  stopping: 2,
  needs_attention: 3,
  problem: 4,
  wrong_screen: 5,
  stuck_play_store: 6,
  phone_frozen: 7,
  needs_login: 8,
  x_missing: 9,
  cooldown: 10,
  prepared: 11,
  ready: 12
};

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

function canRunAndroidCommands() {
  return Boolean(phoneControlState?.android?.available);
}

function androidControlReason() {
  return phoneControlState?.android?.error || "Android in-phone controls need ADB connected to the running cloud phone.";
}

function androidButtonAttrs() {
  return canRunAndroidCommands() ? "" : `disabled title="${escapeHtml(androidControlReason())}"`;
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

function formatDuration(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function formatFuture(value) {
  if (!value) return "";
  const ms = new Date(value).getTime() - Date.now();
  return ms <= 0 ? "due" : `in ${formatDuration(ms)}`;
}

function shortId(value) {
  const text = String(value || "");
  return text.length > 13 ? `${text.slice(0, 6)}...${text.slice(-4)}` : text;
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
  const overview = operatorState?.dailyOverview ?? {};
  const plan = operatorState?.dailyPlan ?? {};
  const localActive = Number(plan.runningProfiles || 0) + Number(plan.startingProfiles || 0);
  nodes.metricProfiles.textContent = multiloginProfilesState.total || analytics.totalAccounts;
  nodes.metricLoggedIn.textContent = Math.max(Number(overview.activeSessions || 0), localActive || analytics.loggedInProfiles);
  nodes.metricSaved.textContent = overview.completedPrompts ?? analytics.savedPosts;
  nodes.metricReview.textContent = overview.attentionItems ?? analytics.flaggedAccounts;
  nodes.dailyProfiles.textContent = overview.profilesUsedToday ?? 0;
  nodes.dailyActive.textContent = Math.max(Number(overview.activeSessions || 0), localActive);
  nodes.dailyDone.textContent = overview.completedPrompts ?? 0;
  nodes.dailyAttention.textContent = overview.attentionItems ?? 0;
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
  const startLabel = isMobile ? "Start + View" : "Start 30m";
  const record = profileRecord(profile.id);
  const status = effectiveProfileStatus(profile);
  const details = [
    isMobile ? "Mobile" : "Browser",
    profile.folderName || profile.folderId,
    profile.device || profile.browserType,
    profile.osType,
    profile.serialNumber ? `Serial ${profile.serialNumber}` : ""
  ]
    .filter(Boolean)
    .join(" | ");
  const recordDetails = [
    record?.issue ? `Issue: ${record.issue}` : "",
    ["starting", "running", "stopping"].includes(status) && record?.lastStartedAt ? `Started ${formatRelative(record.lastStartedAt)}` : "",
    ["running", "starting", "prepared"].includes(status) && record?.autoStopAt ? `Auto-stop ${formatFuture(record.autoStopAt)}` : "",
    record?.cooldownUntil && isCooldownActive(record) ? `Cooldown until ${formatTime(record.cooldownUntil)}` : "",
    record?.lastPromptAt ? `Last prompt ${formatRelative(record.lastPromptAt)}` : "",
    record?.lastCommandAt ? `${record.lastCommand || "Command"} ${formatRelative(record.lastCommandAt)}` : "",
    record?.completedPrompts ? `${record.completedPrompts} done` : ""
  ].filter(Boolean);

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
      ${recordDetails.length ? `<div class="profile-record-line">${recordDetails.map((detail) => `<span>${escapeHtml(detail)}</span>`).join("")}</div>` : ""}
      <footer>
        <span>${profile.lastUsedAt ? `Last used ${escapeHtml(formatRelative(profile.lastUsedAt))}` : "Ready for manual control"}</span>
        <div class="button-row inline">
          <button
            class="secondary mlx-start-profile"
            data-profile-id="${escapeHtml(profile.id)}"
            data-profile-name="${escapeHtml(profile.name || "")}"
            data-folder-id="${escapeHtml(profile.folderId)}"
            data-profile-type="${escapeHtml(profile.profileType || "browser")}"
            ${canStart ? "" : "disabled"}
          >${startLabel}</button>
          ${
            isMobile
              ? `<button
                  class="secondary mlx-open-viewer"
                  data-profile-id="${escapeHtml(profile.id)}"
                  data-profile-name="${escapeHtml(profile.name || "")}"
                  data-folder-id="${escapeHtml(profile.folderId)}"
                  data-profile-type="mobile"
                >Viewer</button>`
              : ""
          }
          ${
            isMobile
              ? `<button
                  class="secondary mlx-open-x"
                  data-profile-id="${escapeHtml(profile.id)}"
                  data-profile-name="${escapeHtml(profile.name || "")}"
                  data-folder-id="${escapeHtml(profile.folderId)}"
                  data-profile-type="mobile"
                >Open X app</button>`
              : ""
          }
          <button
            class="secondary mlx-stop-profile"
            data-profile-id="${escapeHtml(profile.id)}"
            data-profile-name="${escapeHtml(profile.name || "")}"
            data-folder-id="${escapeHtml(profile.folderId)}"
            data-profile-type="${escapeHtml(profile.profileType || "browser")}"
          >Stop</button>
          <button class="secondary queue-profile-review" data-profile-id="${escapeHtml(profile.id)}">Review</button>
          ${renderManualCommandControls(profile)}
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
    nodes.agentRows.innerHTML = `<p class="empty">No local demo workers running.</p>`;
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
  return (operatorState?.operators || operatorState?.agents || []).find((agent) => agent.id === agentId);
}

function multiloginProfileById(profileId) {
  return multiloginProfilesState.profiles.find((profile) => profile.id === profileId);
}

function profileFromButton(button) {
  const profileId = button?.dataset.profileId || "";
  const knownProfile = multiloginProfileById(profileId);
  if (knownProfile) return knownProfile;
  if (!profileId) {
    throw new Error("This button has no Multilogin profile id. Sync profiles and refresh the page.");
  }
  return {
    id: profileId,
    name: button.dataset.profileName || profileId,
    profileType: button.dataset.profileType || "mobile",
    folderId: button.dataset.folderId || "",
    status: button.dataset.profileStatus || "ready"
  };
}

function renderManualCommandControls(profile) {
  if (profile?.profileType !== "mobile") return "";
  const androidReady = canRunAndroidCommands();
  const disabled = androidReady ? "" : "disabled";
  const title = androidReady ? "Runs inside the Android cloud phone." : androidControlReason();
  return `
    <div class="manual-command" data-profile-id="${escapeHtml(profile.id)}">
      <select class="manual-command-select" aria-label="Manual phone command" ${disabled} title="${escapeHtml(title)}">
        <option value="open_x_app">Open X app</option>
        <option value="scroll_prompt">Scroll review</option>
        <option value="scroll_3">Scroll 3x</option>
      </select>
      <button
        class="secondary manual-command-run"
        type="button"
        data-profile-id="${escapeHtml(profile.id)}"
        data-profile-name="${escapeHtml(profile.name || "")}"
        data-folder-id="${escapeHtml(profile.folderId)}"
        data-profile-type="mobile"
        ${disabled}
        title="${escapeHtml(title)}"
      >Run</button>
      ${androidReady ? "" : `<span>${escapeHtml("ADB setup needed")}</span>`}
    </div>
  `;
}

function profileRecord(profileId) {
  return operatorState?.profileRecords?.[profileId] || null;
}

function isCooldownActive(record) {
  return Boolean(record?.cooldownUntil && new Date(record.cooldownUntil).getTime() > Date.now());
}

function effectiveProfileStatus(profile) {
  const session = activeSessionForProfile(profile.id);
  if (session?.status === "running") return "running";
  if (session?.status === "prepared") return "prepared";
  if (session?.status === "needs_attention") return "needs_attention";

  const record = profileRecord(profile.id);
  if (record?.status === "cooldown") return isCooldownActive(record) ? "cooldown" : "ready";
  if (record?.status) return record.status;
  if (profile.status === "starting") return "starting";
  return "ready";
}

function profileBucketId(profile) {
  const status = effectiveProfileStatus(profile);
  if (["running", "prepared", "starting", "stopping"].includes(status)) return "active";
  if (status === "cooldown") return "cooldown";
  if (["needs_login", "x_missing"].includes(status)) return "setup";
  if (["needs_attention", "wrong_screen", "stuck_play_store", "phone_frozen", "problem"].includes(status)) return "attention";
  return "ready";
}

function priorityProfiles() {
  return [...multiloginProfilesState.profiles]
    .map((profile) => ({
      profile,
      record: profileRecord(profile.id),
      session: activeSessionForProfile(profile.id),
      status: effectiveProfileStatus(profile)
    }))
    .sort((left, right) => {
      const statusRank = (PRIORITY_ORDER[left.status] ?? 99) - (PRIORITY_ORDER[right.status] ?? 99);
      if (statusRank) return statusRank;
      const leftTime = new Date(left.record?.updatedAt || left.record?.lastStartedAt || left.profile.lastUsedAt || 0).getTime();
      const rightTime = new Date(right.record?.updatedAt || right.record?.lastStartedAt || right.profile.lastUsedAt || 0).getTime();
      return rightTime - leftTime;
    });
}

function readyProfiles() {
  return multiloginProfilesState.profiles.filter((profile) => profileBucketId(profile) === "ready");
}

function nextReadyProfile() {
  const ready = readyProfiles();
  return ready.find((profile) => profile.profileType === "mobile") || ready[0] || null;
}

function selectedProfilePatch(profile, patch = {}) {
  return {
    profileName: profile?.name || "",
    profileType: profile?.profileType || "browser",
    folderId: profile?.folderId || "",
    ...patch
  };
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

function fillSessionProfileSelect() {
  const previous = nodes.sessionProfileSelect.value || nodes.operatorProfileSelect.value;
  const profiles = multiloginProfilesState.profiles;

  nodes.sessionProfileSelect.innerHTML = profiles.length
    ? profiles
        .map(
          (profile) =>
            `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name || profile.id)} (${escapeHtml(profile.profileType || "browser")})</option>`
        )
        .join("")
    : `<option value="">Sync profiles first</option>`;

  if (profiles.some((profile) => profile.id === previous)) nodes.sessionProfileSelect.value = previous;
}

function fillSessionPresetSelect() {
  const presets = operatorState?.presets || [];
  const previous = nodes.sessionPresetSelect.value;
  nodes.sessionPresetSelect.innerHTML = presets.length
    ? presets.map((preset) => `<option value="${escapeHtml(preset.id)}">${escapeHtml(preset.label)}</option>`).join("")
    : `<option value="">No presets</option>`;
  if (presets.some((preset) => preset.id === previous)) nodes.sessionPresetSelect.value = previous;
}

function activeSessionForProfile(profileId) {
  return (operatorState?.sessions || []).find((session) => session.profileId === profileId && ACTIVE_SESSION_STATUSES.has(session.status));
}

function selectedSessionProfile() {
  return multiloginProfileById(nodes.sessionProfileSelect.value);
}

function selectedSession() {
  const profile = selectedSessionProfile();
  if (profile?.id) return activeSessionForProfile(profile.id) || null;
  return operatorState?.activeSession || null;
}

function assistiveProfile() {
  const activeSession = operatorState?.activeSession;
  const activeProfile = activeSession?.profileId ? multiloginProfileById(activeSession.profileId) : null;
  return activeProfile || selectedSessionProfile() || priorityProfiles()[0]?.profile || null;
}

function renderSessionConsole() {
  if (!operatorState) return;

  fillSessionProfileSelect();
  fillSessionPresetSelect();

  const profile = selectedSessionProfile();
  const session = selectedSession();
  const prompt = session?.currentPrompt || null;
  const startTask = session?.startTaskId ? operatorState.tasks.find((task) => task.id === session.startTaskId) : null;
  const promptDue = prompt ? new Date(prompt.scheduledFor).getTime() <= Date.now() : false;
  const canPrepare = Boolean(profile?.id) && !activeSessionForProfile(profile.id);
  const canStart = Boolean(session && ["prepared", "needs_attention"].includes(session.status));
  const canStop = Boolean(session && session.status !== "stopped");
  const canRunStartTask = Boolean(startTask && ["queued", "failed"].includes(startTask.status));
  const canRecordPrompt = Boolean(session && session.status === "running" && prompt && promptDue);
  const canStartWork = Boolean(profile?.id) && (!session || ["prepared", "needs_attention"].includes(session.status));
  const nextProfile = nextReadyProfile();

  nodes.sessionSummary.textContent = session
    ? `${session.profileName} | ${session.status.replaceAll("_", " ")}`
    : "No active session";
  nodes.openNextProfileButton.disabled = !nextProfile;
  nodes.cooldownProfileButton.disabled = !profile;
  nodes.clearProfileIssueButton.disabled = !profile;
  document.querySelectorAll(".profile-recovery-action").forEach((button) => {
    button.disabled = !profile;
  });
  nodes.startWorkButton.disabled = !canStartWork;
  nodes.prepareSessionButton.disabled = !canPrepare;
  nodes.runSessionStartTaskButton.disabled = !canRunStartTask;
  nodes.startSessionButton.disabled = !canStart;
  nodes.openSessionViewerButton.disabled = !profile || profile.profileType !== "mobile";
  nodes.openSessionXButton.disabled = !profile || profile.profileType !== "mobile";
  nodes.installSessionXButton.disabled = !profile || profile.profileType !== "mobile" || !profile.folderId;
  nodes.stopSessionButton.disabled = !canStop;
  nodes.sessionPromptDoneButton.disabled = !canRecordPrompt;
  nodes.sessionPromptSkipButton.disabled = !canRecordPrompt;
  nodes.sessionPromptAttentionButton.disabled = !canRecordPrompt;

  if (!session) {
    nodes.sessionStatusTitle.textContent = profile ? profile.name || profile.id : "Select a profile";
    nodes.sessionStatusDetail.textContent = profile
      ? "Prepare the profile to queue one start task and create a persistent session."
      : "Sync Multilogin profiles, prepare a profile, then start a session.";
    nodes.sessionStatusTag.textContent = "idle";
    nodes.sessionStatusTag.className = "tag idle";
    nodes.sessionSafetyList.innerHTML = `<p>Profile lifecycle controls only. Website actions are local prompts you complete manually.</p>`;
    nodes.sessionPromptCard.innerHTML = `<p class="empty">No session prompt yet.</p>`;
    nodes.sessionLog.innerHTML = `<p class="empty">No session log yet.</p>`;
    return;
  }

  nodes.sessionStatusTitle.textContent = `${session.profileName} | ${session.presetLabel}`;
  nodes.sessionStatusDetail.textContent =
    session.status === "prepared"
      ? `Prepared. Start task is ${startTask?.status || "queued"}; run it if needed, then start the session.`
      : session.status === "needs_attention"
        ? "Paused for review. Resolve the issue, add a note if needed, then start the session again."
        : `Running since ${formatTime(session.startedAt)}.`;
  nodes.sessionStatusTag.textContent = session.status.replaceAll("_", " ");
  nodes.sessionStatusTag.className = `tag ${session.status}`;
  nodes.sessionSafetyList.innerHTML = (session.warnings || [])
    .map((warning) => `<p>${escapeHtml(warning)}</p>`)
    .join("");

  if (prompt) {
    const futureMs = new Date(prompt.scheduledFor).getTime() - Date.now();
    const waitingText =
      futureMs > 1000
        ? `Next prompt in ${formatDuration(futureMs)} | scheduled for ${formatTime(prompt.scheduledFor)}`
        : "Ready now";
    nodes.sessionPromptCard.innerHTML = `
      <header>
        <div>
          <strong>${escapeHtml(prompt.label)}</strong>
          <p>${escapeHtml(waitingText)}${prompt.delaySec ? ` | delay ${escapeHtml(prompt.delaySec)}s` : ""}</p>
        </div>
        <span class="tag ${promptDue ? "running" : "queued"}">${escapeHtml(promptDue ? "due" : "waiting")}</span>
      </header>
      <p>${escapeHtml(prompt.detail)}</p>
      ${prompt.targetUrl ? `<div class="operator-task-meta"><span>${escapeHtml(prompt.targetUrl)}</span></div>` : ""}
    `;
  } else {
    nodes.sessionPromptCard.innerHTML =
      session.status === "needs_attention"
        ? `<p class="empty">Session needs attention. Add a note and start again when ready.</p>`
        : `<p class="empty">No prompt is active.</p>`;
  }

  const events = session.events || [];
  nodes.sessionLog.innerHTML = events.length
    ? events
        .slice(0, 8)
        .map(
          (event) => `
            <article>
              <header>
                <strong>${escapeHtml(event.label)}</strong>
                <span class="tag ${escapeHtml(event.outcome)}">${escapeHtml(event.outcome.replaceAll("_", " "))}</span>
              </header>
              <p>${escapeHtml(formatRelative(event.createdAt))}${event.notes ? ` | ${escapeHtml(event.notes)}` : ""}</p>
            </article>
          `
        )
        .join("")
    : `<p class="empty">No outcomes recorded yet.</p>`;
}

function renderOperator() {
  if (!operatorState) return;

  const operators = operatorState.operators || operatorState.agents || [];
  fillSelect(nodes.operatorAgentSelect, operators, (agent) => agent.name);
  fillSelect(nodes.operatorFunctionSelect, operatorState.functions, (fn) => fn.label, (fn) => fn.id);
  fillOperatorProfileSelect();

  const summary = operatorState.summary;
  nodes.operatorSummary.textContent = `${summary.activeSessions} sessions, ${summary.runningTasks} running, ${summary.queuedTasks} queued`;
  nodes.operatorAgents.innerHTML = operators
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
    nodes.operatorTaskList.innerHTML = `<p class="empty">No queued or running operator work.</p>`;
    return;
  }

  const renderTaskCard = (task) => {
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
            <button class="secondary operator-task-status" data-task-id="${escapeHtml(task.id)}" data-status="cancelled" ${["queued", "running", "failed"].includes(task.status) ? "" : "disabled"}>Cancel</button>
          </div>
        </footer>
      </article>
    `;
  };

  const groups = [
    {
      title: "Running now",
      tasks: visibleTasks.filter((task) => task.status === "running")
    },
    {
      title: "Needs action",
      tasks: visibleTasks.filter((task) => task.status === "failed")
    },
    {
      title: "Queued next",
      tasks: visibleTasks.filter((task) => task.status === "queued")
    }
  ].filter((group) => group.tasks.length);

  nodes.operatorTaskList.innerHTML = groups
    .map(
      (group) => `
        <section class="operator-task-group">
          <header>
            <strong>${escapeHtml(group.title)}</strong>
            <span>${group.tasks.length}</span>
          </header>
          <div>${group.tasks.map(renderTaskCard).join("")}</div>
        </section>
      `
    )
    .join("");
}

function renderPriorityBoard() {
  if (!operatorState || !nodes.priorityBoard) return;
  const rows = priorityProfiles();
  const activeRows = rows.filter((row) => ["running", "starting", "stopping", "prepared"].includes(row.status));
  const attentionRows = rows.filter((row) =>
    ["needs_attention", "problem", "wrong_screen", "stuck_play_store", "phone_frozen"].includes(row.status)
  );
  nodes.prioritySummary.textContent = `${activeRows.length} active, ${attentionRows.length} attention`;

  if (!rows.length) {
    nodes.priorityBoard.innerHTML = `<p class="empty">Sync Multilogin profiles to see the board.</p>`;
    return;
  }

  nodes.priorityBoard.innerHTML = rows
    .slice(0, 24)
    .map(({ profile, record, session, status }) => {
      const isMobile = profile.profileType === "mobile";
      const statusLine = [
        profile.status ? `Multilogin: ${profile.status}` : "",
        record?.lastStartedAt ? `Started ${formatRelative(record.lastStartedAt)}` : "",
        record?.autoStopAt && ["running", "starting", "prepared"].includes(status) ? `Auto-stop ${formatFuture(record.autoStopAt)}` : "",
        record?.lastCommandAt ? `${record.lastCommand || "Command"} ${formatRelative(record.lastCommandAt)}` : "",
        session?.currentPrompt ? `Prompt: ${session.currentPrompt.label}` : "",
        record?.issue ? `Issue: ${record.issue}` : ""
      ].filter(Boolean);
      return `
        <article class="priority-card ${escapeHtml(profileBucketId(profile))}">
          <header>
            <div>
              <strong>${escapeHtml(profile.name || profile.id)}</strong>
              <p>${escapeHtml(isMobile ? `Mobile | Serial ${profile.serialNumber || "unknown"}` : profile.folderName || profile.folderId || "Browser")}</p>
            </div>
            <span class="tag ${escapeHtml(status)}">${escapeHtml(status.replaceAll("_", " "))}</span>
          </header>
          <div class="priority-meta">
            ${statusLine.length ? statusLine.map((item) => `<span>${escapeHtml(item)}</span>`).join("") : `<span>Ready for assignment</span>`}
          </div>
          <footer>
            <button class="secondary priority-select-profile" type="button" data-profile-id="${escapeHtml(profile.id)}">Select</button>
            <button class="secondary priority-start-profile" type="button" data-profile-id="${escapeHtml(profile.id)}" data-profile-name="${escapeHtml(profile.name || "")}" data-folder-id="${escapeHtml(profile.folderId)}" data-profile-type="${escapeHtml(profile.profileType || "browser")}">Start + View</button>
            ${
              isMobile
                ? `<button class="secondary priority-open-x" type="button" data-profile-id="${escapeHtml(profile.id)}" data-profile-name="${escapeHtml(profile.name || "")}" data-folder-id="${escapeHtml(profile.folderId)}" data-profile-type="mobile" ${androidButtonAttrs()}>Open X app</button>`
                : ""
            }
            ${
              isMobile
                ? `<button class="secondary priority-viewer" type="button" data-profile-id="${escapeHtml(profile.id)}" data-profile-name="${escapeHtml(profile.name || "")}" data-folder-id="${escapeHtml(profile.folderId)}" data-profile-type="mobile">Viewer</button>`
                : ""
            }
            <button class="secondary priority-queue-review" type="button" data-profile-id="${escapeHtml(profile.id)}">Task</button>
            <button class="secondary priority-stop-profile" type="button" data-profile-id="${escapeHtml(profile.id)}" data-profile-name="${escapeHtml(profile.name || "")}" data-folder-id="${escapeHtml(profile.folderId)}" data-profile-type="${escapeHtml(profile.profileType || "browser")}">Stop</button>
            ${renderManualCommandControls(profile)}
          </footer>
        </article>
      `;
    })
    .join("");
}

function latestProfileReport(profileId) {
  const record = profileRecord(profileId);
  const session = activeSessionForProfile(profileId);
  const latestSession = (operatorState?.sessions || []).find((item) => item.profileId === profileId);
  const event = latestSession?.events?.[0] || null;
  if (event) return `${event.label || "Prompt"}: ${event.outcome || "recorded"} ${formatRelative(event.createdAt)}`;
  if (record?.lastCommandAt) return `${record.lastCommandResult || record.lastCommand || "Command completed"} ${formatRelative(record.lastCommandAt)}`;
  if (record?.issue) return record.issue;
  if (record?.lastOpenedAt) return `Viewer opened ${formatRelative(record.lastOpenedAt)}`;
  if (record?.lastStartedAt) return `Started ${formatRelative(record.lastStartedAt)}`;
  if (session?.currentPrompt?.label) return `Current prompt: ${session.currentPrompt.label}`;
  return "No report yet.";
}

function renderPhoneControlPanel() {
  if (!nodes.phoneControlPanel) return;

  if (!phoneControlState) {
    nodes.phoneControlPanel.innerHTML = `<p class="empty">Checking phone control capabilities...</p>`;
    return;
  }

  const multiloginReady = phoneControlState.multilogin?.available;
  const androidReady = phoneControlState.android?.available;
  const adbDevices = phoneControlState.android?.connectedDevices || [];
  const adbDeviceText = adbDevices.length ? adbDevices.join(", ") : "No connected Android phone";
  const adbError = phoneControlState.android?.error || "";

  nodes.phoneControlPanel.innerHTML = `
    <article class="phone-control-card ${multiloginReady ? "ready" : "blocked"}">
      <header>
        <div>
          <strong>Multilogin controls</strong>
          <p>Start, viewer, stop, profile sync, and X install.</p>
        </div>
        <span class="tag ${multiloginReady ? "ready" : "problem"}">${multiloginReady ? "ready" : "blocked"}</span>
      </header>
    </article>
    <article class="phone-control-card ${androidReady ? "ready" : "blocked"}">
      <header>
        <div>
          <strong>Inside-phone controls</strong>
          <p>Open X app and scroll the Android screen.</p>
        </div>
        <span class="tag ${androidReady ? "ready" : "problem"}">${androidReady ? "ready" : "setup needed"}</span>
      </header>
      <div class="phone-control-meta">
        <span>${escapeHtml(adbDeviceText)}</span>
        ${adbError ? `<span>${escapeHtml(adbError)}</span>` : ""}
      </div>
    </article>
    <article class="phone-control-note">
      ${escapeHtml(phoneControlState.explanation || "Multilogin opens the phone. Android commands need a connected phone-control channel.")}
    </article>
  `;
}

function renderAssistiveController() {
  if (!nodes.assistiveController) return;

  const profile = assistiveProfile();
  const androidReady = canRunAndroidCommands();
  const androidAttrs = androidReady ? "" : `disabled title="${escapeHtml(androidControlReason())}"`;
  const draftText = localStorage.getItem("telephones.assistiveDraft") || "";
  const report = assistiveLastReport;

  if (!profile) {
    nodes.assistiveController.innerHTML = `
      <article class="assistive-empty">
        <strong>No profile selected.</strong>
        <span>Sync your Multilogin profiles, then select one of your own phones.</span>
      </article>
    `;
    return;
  }

  nodes.assistiveController.innerHTML = `
    <article class="assistive-panel">
      <header>
        <div>
          <span>Assistive Controller</span>
          <strong>${escapeHtml(profile.name || profile.id)}</strong>
          <p>${escapeHtml(profile.profileType === "mobile" ? `Mobile | Serial ${profile.serialNumber || "unknown"}` : "Browser profile")}</p>
        </div>
        <span class="tag ${androidReady ? "ready" : "problem"}">${androidReady ? "phone control ready" : "viewer only"}</span>
      </header>

      <div class="assistive-actions">
        <button class="assistive-viewer" type="button" data-profile-id="${escapeHtml(profile.id)}">Open Viewer</button>
        <button class="secondary assistive-command" type="button" data-command="open_x_app" ${androidAttrs}>Open X</button>
        <button class="secondary assistive-command" type="button" data-command="scroll_down" data-count="1" ${androidAttrs}>Scroll</button>
        <button class="secondary assistive-command" type="button" data-command="scroll_down" data-count="3" ${androidAttrs}>Scroll 3x</button>
        <button class="secondary assistive-command" type="button" data-command="screenshot" ${androidAttrs}>Screenshot</button>
        <button class="secondary assistive-command" type="button" data-command="key_back" ${androidAttrs}>Back</button>
        <button class="secondary assistive-command" type="button" data-command="key_home" ${androidAttrs}>Home</button>
      </div>

      <div class="assistive-draft-grid">
        <label>
          Draft helper
          <textarea id="assistiveDraftText" rows="3" placeholder="Write or paste a draft. Focus the field on the phone, then use Type Draft.">${escapeHtml(draftText)}</textarea>
        </label>
        <button class="secondary assistive-command" type="button" data-command="type_text" ${androidAttrs}>Type Draft</button>
      </div>

      <div class="assistive-tap-grid">
        <label>
          X %
          <input id="assistiveTapX" type="number" min="0" max="100" value="50" />
        </label>
        <label>
          Y %
          <input id="assistiveTapY" type="number" min="0" max="100" value="50" />
        </label>
        <button class="secondary assistive-command" type="button" data-command="tap" ${androidAttrs}>Tap Point</button>
      </div>

      <div class="assistive-report">
        ${
          report
            ? `
              <strong>${escapeHtml(report.message || "Command completed.")}</strong>
              <span>${escapeHtml(formatRelative(report.at))}</span>
              ${report.image ? `<img src="${escapeHtml(report.image)}" alt="Latest phone screenshot" />` : ""}
            `
            : `<p class="empty">No assistive command report yet.</p>`
        }
      </div>
    </article>
  `;
}

function renderLiveAgentBoard() {
  if (!operatorState || !nodes.liveAgentBoard) return;
  const rows = priorityProfiles();
  const liveRows = rows.filter((row) => ACTIVE_PROFILE_STATUSES.has(row.status) || row.record?.issue).slice(0, 8);
  const checked = liveStatusState.lastCheckedAt ? `Checked ${formatRelative(liveStatusState.lastCheckedAt)}` : "Waiting for first check";
  const activeCount = rows.filter((row) => ACTIVE_PROFILE_STATUSES.has(row.status)).length;
  const attentionCount = rows.filter((row) => row.record?.issue).length;
  nodes.liveAgentSummary.textContent = liveStatusState.error
    ? `Checker error: ${liveStatusState.error}`
    : `${activeCount} active, ${attentionCount} issue${attentionCount === 1 ? "" : "s"} | ${checked}`;

  if (!liveRows.length) {
    nodes.liveAgentBoard.innerHTML = `
      <div class="live-empty">
        <strong>No active profile visible yet.</strong>
        <span>Click Start + View on a profile. This panel will show Multilogin status, auto-stop, and the last report.</span>
      </div>
    `;
    return;
  }

  nodes.liveAgentBoard.innerHTML = liveRows
    .map(({ profile, record, session, status }) => {
      const isMobile = profile.profileType === "mobile";
      const facts = [
        profile.status ? `Multilogin: ${profile.status}` : "",
        record?.lastSeenAt ? `Checked ${formatRelative(record.lastSeenAt)}` : "",
        record?.autoStopAt && ACTIVE_PROFILE_STATUSES.has(status) ? `Auto-stop ${formatFuture(record.autoStopAt)}` : "",
        record?.lastCommandAt ? `${record.lastCommand || "Command"} ${formatRelative(record.lastCommandAt)}` : "",
        session?.status ? `Session: ${session.status}` : "",
        record?.completedPrompts ? `${record.completedPrompts} done` : "",
        record?.skippedPrompts ? `${record.skippedPrompts} skipped` : "",
        record?.attentionCount ? `${record.attentionCount} attention` : ""
      ].filter(Boolean);

      return `
        <article class="live-agent-card ${escapeHtml(status)}">
          <header>
            <div>
              <strong>${escapeHtml(profile.name || profile.id)}</strong>
              <p>${escapeHtml(isMobile ? `Mobile | Serial ${profile.serialNumber || "unknown"}` : profile.folderName || "Browser profile")}</p>
            </div>
            <span class="tag ${escapeHtml(status)}">${escapeHtml(status.replaceAll("_", " "))}</span>
          </header>
          <div class="live-facts">${facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}</div>
          <div class="live-report">${escapeHtml(latestProfileReport(profile.id))}</div>
          <footer>
            ${
              isMobile
                ? `<button class="secondary priority-viewer" type="button" data-profile-id="${escapeHtml(profile.id)}" data-profile-name="${escapeHtml(profile.name || "")}" data-folder-id="${escapeHtml(profile.folderId)}" data-profile-type="mobile">Viewer</button>`
                : ""
            }
            ${
              isMobile
                ? `<button class="secondary priority-open-x" type="button" data-profile-id="${escapeHtml(profile.id)}" data-profile-name="${escapeHtml(profile.name || "")}" data-folder-id="${escapeHtml(profile.folderId)}" data-profile-type="mobile" ${androidButtonAttrs()}>Open X app</button>`
                : ""
            }
            <button class="secondary priority-queue-review" type="button" data-profile-id="${escapeHtml(profile.id)}">Task</button>
            <button class="secondary live-mark-attention" type="button" data-profile-id="${escapeHtml(profile.id)}">Needs attention</button>
            <button class="secondary priority-stop-profile" type="button" data-profile-id="${escapeHtml(profile.id)}" data-profile-name="${escapeHtml(profile.name || "")}" data-folder-id="${escapeHtml(profile.folderId)}" data-profile-type="${escapeHtml(profile.profileType || "browser")}">Stop</button>
            ${renderManualCommandControls(profile)}
          </footer>
        </article>
      `;
    })
    .join("");
}

function renderSessionOverview() {
  if (!operatorState || !nodes.sessionOverview) return;

  const sessions = operatorState.sessions || [];
  const activeSessions = sessions.filter((session) => ACTIVE_SESSION_STATUSES.has(session.status));
  const runningTasks = (operatorState.tasks || []).filter((task) => task.status === "running");
  const queuedTasks = (operatorState.tasks || []).filter((task) => task.status === "queued");
  const failedTasks = (operatorState.tasks || []).filter((task) => task.status === "failed");
  const rows = priorityProfiles();
  const readyRows = rows.filter((row) => row.status === "ready").slice(0, 4);
  const attentionRows = rows
    .filter((row) => row.record?.issue || ["needs_attention", "problem", "wrong_screen", "stuck_play_store", "phone_frozen"].includes(row.status))
    .slice(0, 4);

  const renderActiveSession = (session) => {
    const record = profileRecord(session.profileId);
    const prompt = session.currentPrompt;
    const detail = prompt
      ? `${prompt.label}${prompt.scheduledFor ? ` | ${formatFuture(prompt.scheduledFor)}` : ""}`
      : record?.lastCommandResult || "No active prompt.";
    return `
      <article class="session-overview-row active">
        <div>
          <strong>${escapeHtml(session.profileName || session.profileId)}</strong>
          <span>${escapeHtml(session.status.replaceAll("_", " "))}</span>
          <p>${escapeHtml(detail)}</p>
        </div>
        <div class="button-row inline">
          <button class="secondary session-overview-select" type="button" data-profile-id="${escapeHtml(session.profileId)}">Select</button>
          <button class="secondary session-overview-stop" type="button" data-session-id="${escapeHtml(session.id)}">Stop + clear</button>
        </div>
      </article>
    `;
  };

  const renderTaskRow = (task) => `
    <article class="session-overview-row">
      <div>
        <strong>${escapeHtml(task.functionLabel)}</strong>
        <span>${escapeHtml(task.status)}</span>
        <p>${escapeHtml(task.profileName)}${task.scheduledFor ? ` | ${escapeHtml(formatTime(task.scheduledFor))}` : ""}</p>
      </div>
    </article>
  `;

  const renderProfileRow = ({ profile, status, record }) => `
    <article class="session-overview-row">
      <div>
        <strong>${escapeHtml(profile.name || profile.id)}</strong>
        <span>${escapeHtml(status.replaceAll("_", " "))}</span>
        <p>${escapeHtml(record?.issue || record?.lastCommandResult || "Ready")}</p>
      </div>
      <button class="secondary session-overview-select" type="button" data-profile-id="${escapeHtml(profile.id)}">Select</button>
    </article>
  `;

  nodes.sessionOverview.innerHTML = `
    <section class="session-overview-block primary">
      <header>
        <span>Active sessions</span>
        <strong>${activeSessions.length}</strong>
      </header>
      <div>
        ${
          activeSessions.length
            ? activeSessions.slice(0, 4).map(renderActiveSession).join("")
            : `<p class="empty">No profile session is active.</p>`
        }
      </div>
    </section>
    <section class="session-overview-block">
      <header>
        <span>Work queue</span>
        <strong>${runningTasks.length}/${queuedTasks.length}</strong>
      </header>
      <div>
        ${
          [...runningTasks, ...failedTasks, ...queuedTasks].slice(0, 5).map(renderTaskRow).join("") ||
          `<p class="empty">No task is waiting.</p>`
        }
      </div>
    </section>
    <section class="session-overview-block">
      <header>
        <span>Ready next</span>
        <strong>${readyRows.length}</strong>
      </header>
      <div>
        ${readyRows.length ? readyRows.map(renderProfileRow).join("") : `<p class="empty">No ready profile synced.</p>`}
      </div>
    </section>
    <section class="session-overview-block attention">
      <header>
        <span>Attention</span>
        <strong>${attentionRows.length}</strong>
      </header>
      <div>
        ${attentionRows.length ? attentionRows.map(renderProfileRow).join("") : `<p class="empty">No active issues.</p>`}
      </div>
    </section>
  `;
}

function renderProfileBuckets() {
  if (!operatorState || !nodes.profileBuckets) return;

  const groups = Object.fromEntries(PROFILE_BUCKETS.map((bucket) => [bucket.id, []]));
  multiloginProfilesState.profiles.forEach((profile) => {
    groups[profileBucketId(profile)].push(profile);
  });

  nodes.profileBucketSummary.textContent = `${groups.ready.length} ready, ${groups.attention.length} attention`;

  if (!multiloginProfilesState.profiles.length) {
    nodes.profileBuckets.innerHTML = `<p class="empty">Sync Multilogin profiles to build buckets.</p>`;
    return;
  }

  nodes.profileBuckets.innerHTML = PROFILE_BUCKETS.map((bucket) => {
    const profiles = groups[bucket.id] || [];
    return `
      <article class="profile-bucket ${escapeHtml(bucket.id)}">
        <header>
          <strong>${escapeHtml(bucket.label)}</strong>
          <span>${profiles.length}</span>
        </header>
        <div>
          ${
            profiles.length
              ? profiles
                  .slice(0, 8)
                  .map((profile) => {
                    const record = profileRecord(profile.id);
                    const issue = record?.issue ? ` | ${record.issue}` : "";
                    return `
                      <button class="bucket-profile" type="button" data-profile-id="${escapeHtml(profile.id)}">
                        ${escapeHtml(profile.name || profile.id)}${escapeHtml(issue)}
                      </button>
                    `;
                  })
                  .join("")
              : `<p class="empty">None</p>`
          }
        </div>
      </article>
    `;
  }).join("");
}

function renderReviewQueue() {
  if (!operatorState || !nodes.reviewQueueList) return;
  const items = (operatorState.reviewItems || []).filter((item) => item.status === "open");
  nodes.reviewQueueSummary.textContent = `${items.length} open`;

  if (!items.length) {
    nodes.reviewQueueList.innerHTML = `<p class="empty">No review items.</p>`;
    return;
  }

  nodes.reviewQueueList.innerHTML = items
    .slice(0, 20)
    .map(
      (item) => `
        <article class="review-item">
          <header>
            <strong>${escapeHtml(item.profileName || item.profileId)}</strong>
            <span>${escapeHtml(formatRelative(item.createdAt))}</span>
          </header>
          <p>${escapeHtml(item.note || "Review this item manually.")}</p>
          <div class="operator-task-meta">
            <span>${escapeHtml(item.url || "No reference")}</span>
          </div>
          <footer>
            <button class="secondary review-open-item" type="button" data-review-id="${escapeHtml(item.id)}">Open</button>
            <button class="secondary review-status-item" type="button" data-review-id="${escapeHtml(item.id)}" data-status="done">Done</button>
            <button class="secondary review-status-item" type="button" data-review-id="${escapeHtml(item.id)}" data-status="archived">Archive</button>
          </footer>
        </article>
      `
    )
    .join("");
}

function renderCommentDrafts() {
  if (!operatorState || !nodes.commentDraftList) return;
  const drafts = (operatorState.commentDrafts || []).filter((draft) => draft.status !== "archived");
  nodes.commentDraftSummary.textContent = `${drafts.length} active`;

  if (!drafts.length) {
    nodes.commentDraftList.innerHTML = `<p class="empty">No drafts yet.</p>`;
    return;
  }

  nodes.commentDraftList.innerHTML = drafts
    .slice(0, 20)
    .map(
      (draft) => `
        <article class="comment-draft">
          <header>
            <strong>${escapeHtml(draft.label || "Draft")}</strong>
            <span>${draft.system ? "starter" : escapeHtml(formatRelative(draft.updatedAt))}</span>
          </header>
          <p>${escapeHtml(draft.text)}</p>
          <footer>
            <button class="secondary copy-comment-draft" type="button" data-draft-id="${escapeHtml(draft.id)}">Copy</button>
            ${draft.system ? "" : `<button class="secondary archive-comment-draft" type="button" data-draft-id="${escapeHtml(draft.id)}">Archive</button>`}
          </footer>
        </article>
      `
    )
    .join("");
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
      : multiloginState.config.hasXcli
        ? "Enabled, xcli"
        : "Enabled, no token"
    : "Disabled";

  nodes.multiloginStatus.textContent = status;
  nodes.multiloginStatus.classList.toggle("online", multiloginState.config.enabled);
  nodes.multiloginRunButton.disabled = !multiloginState.config.enabled;
  nodes.multiloginProfilesButton.disabled = !multiloginState.config.enabled || (!multiloginState.config.hasToken && !multiloginState.config.hasXcli);
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
  renderPhoneControlPanel();
  renderAssistiveController();
  renderLiveAgentBoard();
  renderSessionOverview();
  renderPriorityBoard();
  renderSessionConsole();
  renderOperator();
  renderProfileBuckets();
  renderReviewQueue();
  renderCommentDrafts();
  renderMultilogin();
}

async function loadState({ quiet = false } = {}) {
  try {
    const [state, multilogin, operator, phoneControl] = await Promise.all([
      api("/api/state"),
      api("/api/multilogin"),
      api("/api/operator"),
      api("/api/multilogin/control-status")
    ]);
    appState = state;
    multiloginState = multilogin;
    operatorState = operator;
    phoneControlState = phoneControl;
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
  if (!multiloginState?.config.enabled || (!multiloginState?.config.hasToken && !multiloginState?.config.hasXcli)) {
    multiloginProfilesState = {
      profiles: [],
      total: 0,
      loading: false,
      error: "Enable Multilogin with a token or local xcli before syncing profiles.",
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
    await refreshLiveStatuses({ quiet: true });
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

async function refreshLiveStatuses({ quiet = true } = {}) {
  const ids = multiloginProfilesState.profiles.filter((profile) => profile.profileType === "mobile").map((profile) => profile.id);
  if (!ids.length || liveStatusState.checking) return;

  liveStatusState = {
    ...liveStatusState,
    checking: true,
    error: ""
  };
  renderLiveAgentBoard();

  try {
    const result = await api(`/api/multilogin/mobile-statuses?ids=${encodeURIComponent(ids.join(","))}`);
    const statuses = result.statuses || {};
    multiloginProfilesState = {
      ...multiloginProfilesState,
      profiles: multiloginProfilesState.profiles.map((profile) => {
        const status = statuses[profile.id];
        return status
          ? {
              ...profile,
              status: status.status || profile.status,
              rawStatus: status.rawStatus || profile.rawStatus
            }
          : profile;
      })
    };
    if (result.snapshot) operatorState = result.snapshot;
    liveStatusState = {
      checking: false,
      lastCheckedAt: result.requestedAt || new Date().toISOString(),
      error: ""
    };
    render();
  } catch (error) {
    liveStatusState = {
      checking: false,
      lastCheckedAt: liveStatusState.lastCheckedAt,
      error: error.message
    };
    renderLiveAgentBoard();
    if (!quiet) showToast(error.message);
  }
}

async function refreshOperator() {
  operatorState = await api("/api/operator");
  render();
}

async function queueOperatorTask({ functionId, profileId, targetUrl, notes, delaySec = 0, silent = false }) {
  const profile = multiloginProfileById(profileId);
  const operators = operatorState?.operators || operatorState?.agents || [];
  const agent = operators.find((item) => item.functionIds.includes(functionId)) ?? operators[0];
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

function sessionPayload(profile) {
  return {
    agentId: nodes.operatorAgentSelect.value,
    presetId: nodes.sessionPresetSelect.value || "review_mode",
    profileId: profile.id,
    profileName: profile.name,
    profileType: profile.profileType || "browser",
    folderId: profile.folderId || "",
    targetUrl: nodes.sessionTargetUrl.value,
    notes: nodes.sessionNotes.value,
    openX: profile.profileType === "mobile" && canRunAndroidCommands(),
    runUiMacro: false
  };
}

async function updateProfileState(profile, patch, message) {
  if (!profile?.id) throw new Error("Select a profile first.");
  const result = await api(`/api/operator/profiles/${encodeURIComponent(profile.id)}/state`, {
    method: "POST",
    body: JSON.stringify(selectedProfilePatch(profile, patch))
  });
  operatorState = result.snapshot;
  render();
  if (message) showToast(message);
  return result.record;
}

async function startWorkForProfile(profile, { message = "Work session started." } = {}) {
  if (!profile) throw new Error("Sync and select a profile first.");
  nodes.sessionProfileSelect.value = profile.id;
  nodes.operatorProfileSelect.value = profile.id;
  const result = await api("/api/operator/workflows/start", {
    method: "POST",
    body: JSON.stringify(sessionPayload(profile))
  });
  operatorState = result.snapshot;
  render();
  await loadMultiloginProfiles({ quiet: true });
  if (result.openXResult?.error) {
    showToast(`Started, but Open X app failed: ${result.openXResult.error}`);
  } else if (profile.profileType === "mobile" && !canRunAndroidCommands()) {
    showToast("Phone opened through Multilogin. Open X manually until inside-phone controls are connected.");
  } else if (message) {
    showToast(message);
  }
  return result;
}

async function startProfileControl(profile, { message = "Started. Auto-stop in 30m." } = {}) {
  if (!profile?.id) throw new Error("Select a profile first.");
  const successMessage = profile.profileType === "mobile" ? "Opened visible phone. Auto-stop in 30m." : message;
  const result = await api(`/api/multilogin/profiles/${encodeURIComponent(profile.id)}/start`, {
    method: "POST",
    body: JSON.stringify({
      profileName: profile.name || "",
      folderId: profile.folderId || "",
      profileType: profile.profileType || "browser"
    })
  });
  if (result.snapshot) operatorState = result.snapshot;
  await loadMultiloginProfiles({ quiet: true });
  const warning = result.response?.payload?.startWarning || result.response?.payload?.viewerWarning || result.response?.payload?.launchWarning;
  showToast(
    result.uncertain
      ? "Start requested; Multilogin confirmation was unclear. Check Live Agent."
      : warning
        ? successMessage.replace("Opened visible phone.", "Phone opened with warning.").replace("Started.", "Started with warning.")
        : successMessage
  );
  return result;
}

async function openViewerControl(profile, { message = "Opened Multilogin viewer." } = {}) {
  if (!profile?.id) throw new Error("Select a profile first.");
  const result = await api(`/api/multilogin/profiles/${encodeURIComponent(profile.id)}/viewer`, {
    method: "POST",
    body: JSON.stringify({
      profileName: profile.name || "",
      profileType: profile.profileType || "mobile",
      folderId: profile.folderId || ""
    })
  });
  if (result.snapshot) operatorState = result.snapshot;
  await loadMultiloginProfiles({ quiet: true });
  const warning = result.response?.payload?.launchWarning;
  showToast(warning ? "Viewer requested; Multilogin confirmation was unclear. Check Live Agent." : message);
  return result;
}

async function openXControl(profile, { message = "Opened Android X app." } = {}) {
  if (!profile?.id) throw new Error("Select a profile first.");
  if (!canRunAndroidCommands()) {
    await openViewerControl(profile, { message: "Opened phone viewer. Open X manually until inside-phone controls are connected." });
    return null;
  }

  const result = await api(`/api/multilogin/profiles/${encodeURIComponent(profile.id)}/open-x`, {
    method: "POST",
    body: JSON.stringify({
      profileName: profile.name || "",
      profileType: profile.profileType || "mobile",
      folderId: profile.folderId || "",
      runUiMacro: false
    })
  });
  if (result.snapshot) operatorState = result.snapshot;
  await loadMultiloginProfiles({ quiet: true });
  const warning = result.response?.payload?.viewerWarning || result.response?.payload?.macroWarning || result.response?.payload?.installWarning;
  showToast(warning ? "X app launch returned a warning. Check Live Agent." : message);
  return result;
}

async function runManualCommandControl(profile, command, options = {}) {
  if (!profile?.id) throw new Error("Select a profile first.");
  if (profile.profileType !== "mobile") throw new Error("Manual phone commands are only available for mobile profiles.");
  if (!canRunAndroidCommands()) throw new Error(androidControlReason());

  const result = await api(`/api/multilogin/profiles/${encodeURIComponent(profile.id)}/command`, {
    method: "POST",
    body: JSON.stringify({
      profileName: profile.name || "",
      profileType: profile.profileType || "mobile",
      folderId: profile.folderId || "",
      command,
      ...options
    })
  });
  if (result.snapshot) operatorState = result.snapshot;
  const payload = result.response?.payload || {};
  assistiveLastReport = {
    profileId: profile.id,
    message: payload.message || `${result.commandLabel || "Command"} completed.`,
    image: payload.imageBase64 ? `data:${payload.imageMime || "image/png"};base64,${payload.imageBase64}` : null,
    at: result.requestedAt || new Date().toISOString()
  };
  render();
  showToast(assistiveLastReport.message);
  return result;
}

async function stopProfileControl(profile, { message = "Stopped Multilogin profile." } = {}) {
  if (!profile?.id) throw new Error("Select a profile first.");
  const result = await api(`/api/multilogin/profiles/${encodeURIComponent(profile.id)}/stop`, {
    method: "POST",
    body: JSON.stringify({
      profileName: profile.name || "",
      profileType: profile.profileType || "browser",
      folderId: profile.folderId || ""
    })
  });
  if (result.snapshot) operatorState = result.snapshot;
  await loadMultiloginProfiles({ quiet: true });
  const warnings = result.response?.payload?.warnings || [];
  const cleanupText = result.cleanup?.cancelledTasks ? ` Cleared ${result.cleanup.cancelledTasks} task(s).` : "";
  showToast(warnings.length ? "Stop requested with Multilogin warning. Check Priority Board." : `${message}${cleanupText}`);
  return result;
}

async function queueRandomPlan(profileId) {
  const profile = multiloginProfileById(profileId);
  if (!profile) throw new Error("Sync and select a profile first.");
  if (queuePlanInFlight) return;

  queuePlanInFlight = true;
  try {
    const result = await api("/api/operator/plan", {
      method: "POST",
      body: JSON.stringify({
        agentId: nodes.operatorAgentSelect.value,
        presetId: nodes.sessionPresetSelect.value || "review_mode",
        profileId: profile.id,
        profileName: profile.name,
        profileType: profile.profileType || "browser",
        folderId: profile.folderId || "",
        targetUrl: nodes.operatorTargetUrl.value || nodes.sessionTargetUrl.value,
        notes: nodes.operatorNotes.value || nodes.sessionNotes.value
      })
    });
    operatorState = result.snapshot;
    render();
    showToast(
      result.startTaskAdded
        ? `Queued start plus ${Math.max(0, result.tasks.length - 1)} random prompt(s).`
        : "Queued one random prompt."
    );
  } finally {
    queuePlanInFlight = false;
  }
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

nodes.sessionProfileSelect.addEventListener("change", () => {
  nodes.operatorProfileSelect.value = nodes.sessionProfileSelect.value;
  renderSessionConsole();
});

nodes.operatorProfileSelect.addEventListener("change", () => {
  nodes.sessionProfileSelect.value = nodes.operatorProfileSelect.value;
  renderSessionConsole();
});

nodes.startWorkButton.addEventListener("click", async () => {
  const profile = selectedSessionProfile();
  try {
    nodes.startWorkButton.disabled = true;
    await startWorkForProfile(profile);
  } catch (error) {
    await refreshOperator().catch(() => {});
    showToast(error.message);
  }
});

nodes.openNextProfileButton.addEventListener("click", async () => {
  const profile = nextReadyProfile();
  if (!profile) {
    showToast("No ready profile available.");
    return;
  }

  try {
    nodes.openNextProfileButton.disabled = true;
    await startWorkForProfile(profile, { message: `Opened ${profile.name || profile.id}.` });
  } catch (error) {
    await refreshOperator().catch(() => {});
    showToast(error.message);
  }
});

nodes.cooldownProfileButton.addEventListener("click", async () => {
  const profile = selectedSessionProfile();
  try {
    await updateProfileState(profile, { cooldownMinutes: 60, issue: "" }, "Profile cooled down for 1h.");
  } catch (error) {
    showToast(error.message);
  }
});

nodes.clearProfileIssueButton.addEventListener("click", async () => {
  const profile = selectedSessionProfile();
  try {
    await updateProfileState(
      profile,
      { status: "ready", cooldownUntil: null, autoStopAt: null, activeSessionId: "", issue: "" },
      "Profile marked ready."
    );
  } catch (error) {
    showToast(error.message);
  }
});

nodes.prepareSessionButton.addEventListener("click", async () => {
  const profile = selectedSessionProfile();
  if (!profile) {
    showToast("Sync and select a profile first.");
    return;
  }

  try {
    const result = await api("/api/operator/sessions", {
      method: "POST",
      body: JSON.stringify(sessionPayload(profile))
    });
    operatorState = result.snapshot;
    render();
    showToast("Profile session prepared.");
  } catch (error) {
    showToast(error.message);
  }
});

nodes.runSessionStartTaskButton.addEventListener("click", async () => {
  const session = selectedSession();
  if (!session?.startTaskId) {
    showToast("Prepare a session first.");
    return;
  }

  try {
    const result = await api(`/api/operator/tasks/${encodeURIComponent(session.startTaskId)}/run`, {
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
});

nodes.startSessionButton.addEventListener("click", async () => {
  const session = selectedSession();
  if (!session) {
    showToast("Prepare a session first.");
    return;
  }

  try {
    const result = await api(`/api/operator/sessions/${encodeURIComponent(session.id)}/start`, {
      method: "POST",
      body: "{}"
    });
    operatorState = result.snapshot;
    render();
    showToast("Session started.");
  } catch (error) {
    showToast(error.message);
  }
});

nodes.stopSessionButton.addEventListener("click", async () => {
  const session = selectedSession();
  if (!session) return;

  try {
    const result = await api(`/api/operator/sessions/${encodeURIComponent(session.id)}/stop`, {
      method: "POST",
      body: JSON.stringify({ notes: nodes.sessionNotes.value })
    });
    operatorState = result.snapshot;
    render();
    const count = result.session?.cleanup?.cancelledTaskCount || 0;
    showToast(`Session stopped. Cleared ${count} task${count === 1 ? "" : "s"}.`);
  } catch (error) {
    showToast(error.message);
  }
});

nodes.openSessionViewerButton.addEventListener("click", async () => {
  const profile = selectedSessionProfile();
  if (!profile) return;

  try {
    await openViewerControl(profile);
  } catch (error) {
    showToast(error.message);
  }
});

nodes.openSessionXButton.addEventListener("click", async () => {
  const profile = selectedSessionProfile();
  if (!profile) return;

  try {
    await openXControl(profile);
  } catch (error) {
    showToast(error.message);
  }
});

nodes.installSessionXButton.addEventListener("click", async () => {
  const profile = selectedSessionProfile();
  if (!profile) return;

  try {
    await api(`/api/multilogin/profiles/${encodeURIComponent(profile.id)}/install-x`, {
      method: "POST",
      body: JSON.stringify({
        profileType: profile.profileType,
        folderId: profile.folderId
      })
    });
    showToast("X install requested for this mobile group.");
  } catch (error) {
    showToast(error.message);
  }
});

async function recordSessionPrompt(outcome) {
  const session = selectedSession();
  if (!session) return;

  try {
    const result = await api(`/api/operator/sessions/${encodeURIComponent(session.id)}/prompt`, {
      method: "POST",
      body: JSON.stringify({
        outcome,
        notes: nodes.sessionNotes.value
      })
    });
    operatorState = result.snapshot;
    render();
    showToast(outcome === "attention" ? "Session marked for attention." : "Prompt recorded.");
  } catch (error) {
    showToast(error.message);
  }
}

nodes.sessionPromptDoneButton.addEventListener("click", () => recordSessionPrompt("done"));
nodes.sessionPromptSkipButton.addEventListener("click", () => recordSessionPrompt("skipped"));
nodes.sessionPromptAttentionButton.addEventListener("click", () => recordSessionPrompt("attention"));

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

nodes.reviewItemForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const profile = selectedSessionProfile();

  try {
    const result = await api("/api/operator/review-items", {
      method: "POST",
      body: JSON.stringify({
        ...selectedProfilePatch(profile),
        profileId: profile?.id || "",
        url: nodes.reviewItemUrl.value || nodes.sessionTargetUrl.value,
        note: nodes.reviewItemNote.value,
        source: "dashboard"
      })
    });
    operatorState = result.snapshot;
    nodes.reviewItemNote.value = "";
    render();
    showToast("Review item added.");
  } catch (error) {
    showToast(error.message);
  }
});

nodes.commentDraftForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const result = await api("/api/operator/comment-drafts", {
      method: "POST",
      body: JSON.stringify({
        label: nodes.commentDraftLabel.value,
        text: nodes.commentDraftText.value
      })
    });
    operatorState = result.snapshot;
    nodes.commentDraftText.value = "";
    render();
    showToast("Draft added.");
  } catch (error) {
    showToast(error.message);
  }
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
  const mlxOpenXButton = event.target.closest(".mlx-open-x");
  const mlxStopButton = event.target.closest(".mlx-stop-profile");
  const queueReviewButton = event.target.closest(".queue-profile-review");
  const recoveryButton = event.target.closest(".profile-recovery-action");
  const bucketProfileButton = event.target.closest(".bucket-profile");
  const reviewOpenButton = event.target.closest(".review-open-item");
  const reviewStatusButton = event.target.closest(".review-status-item");
  const copyDraftButton = event.target.closest(".copy-comment-draft");
  const archiveDraftButton = event.target.closest(".archive-comment-draft");
  const prioritySelectButton = event.target.closest(".priority-select-profile");
  const priorityStartButton = event.target.closest(".priority-start-profile");
  const priorityOpenXButton = event.target.closest(".priority-open-x");
  const priorityViewerButton = event.target.closest(".priority-viewer");
  const priorityQueueButton = event.target.closest(".priority-queue-review");
  const priorityStopButton = event.target.closest(".priority-stop-profile");
  const liveAttentionButton = event.target.closest(".live-mark-attention");
  const manualCommandButton = event.target.closest(".manual-command-run");
  const operatorRunButton = event.target.closest(".operator-run-task");
  const operatorStatusButton = event.target.closest(".operator-task-status");
  const sessionOverviewSelectButton = event.target.closest(".session-overview-select");
  const sessionOverviewStopButton = event.target.closest(".session-overview-stop");
  const assistiveViewerButton = event.target.closest(".assistive-viewer");
  const assistiveCommandButton = event.target.closest(".assistive-command");

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
      await startProfileControl(profileFromButton(mlxStartButton));
    } catch (error) {
      showToast(error.message);
    }
  }

  if (mlxOpenViewerButton) {
    try {
      await openViewerControl(profileFromButton(mlxOpenViewerButton));
    } catch (error) {
      showToast(error.message);
    }
  }

  if (mlxOpenXButton) {
    try {
      await openXControl(profileFromButton(mlxOpenXButton));
    } catch (error) {
      showToast(error.message);
    }
  }

  if (mlxStopButton) {
    try {
      await stopProfileControl(profileFromButton(mlxStopButton));
    } catch (error) {
      showToast(error.message);
    }
  }

  if (queueReviewButton) {
    try {
      await queueOperatorTask({
        functionId: canRunAndroidCommands() ? "open_x_app" : "open_post_prompt",
        profileId: queueReviewButton.dataset.profileId,
        targetUrl: "",
        notes: canRunAndroidCommands() ? "Open X app for review" : "Review manually in the visible phone viewer"
      });
    } catch (error) {
      showToast(error.message);
    }
  }

  if (recoveryButton) {
    const profile = selectedSessionProfile();
    try {
      await updateProfileState(
        profile,
        {
          status: recoveryButton.dataset.status,
          issue: recoveryButton.dataset.issue || recoveryButton.textContent.trim()
        },
        "Profile state updated."
      );
    } catch (error) {
      showToast(error.message);
    }
  }

  if (bucketProfileButton) {
    const profile = multiloginProfileById(bucketProfileButton.dataset.profileId);
    if (profile) {
      nodes.sessionProfileSelect.value = profile.id;
      nodes.operatorProfileSelect.value = profile.id;
      render();
    }
  }

  if (reviewOpenButton) {
    const item = (operatorState?.reviewItems || []).find((entry) => entry.id === reviewOpenButton.dataset.reviewId);
    const profile = item ? multiloginProfileById(item.profileId) : null;
    if (!item || !profile) {
      showToast("Sync the review profile first.");
    } else {
      try {
        nodes.sessionTargetUrl.value = item.url || "";
        nodes.sessionNotes.value = item.note || nodes.sessionNotes.value;
        await startWorkForProfile(profile, { message: "Review profile opened." });
      } catch (error) {
        await refreshOperator().catch(() => {});
        showToast(error.message);
      }
    }
  }

  if (reviewStatusButton) {
    try {
      const result = await api(`/api/operator/review-items/${encodeURIComponent(reviewStatusButton.dataset.reviewId)}`, {
        method: "POST",
        body: JSON.stringify({ status: reviewStatusButton.dataset.status })
      });
      operatorState = result.snapshot;
      render();
      showToast(`Review item ${reviewStatusButton.dataset.status}.`);
    } catch (error) {
      showToast(error.message);
    }
  }

  if (copyDraftButton) {
    const draft = (operatorState?.commentDrafts || []).find((entry) => entry.id === copyDraftButton.dataset.draftId);
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.text);
      showToast("Draft copied.");
    } catch {
      showToast(draft.text);
    }
  }

  if (archiveDraftButton) {
    try {
      const result = await api(`/api/operator/comment-drafts/${encodeURIComponent(archiveDraftButton.dataset.draftId)}`, {
        method: "POST",
        body: JSON.stringify({ status: "archived" })
      });
      operatorState = result.snapshot;
      render();
      showToast("Draft archived.");
    } catch (error) {
      showToast(error.message);
    }
  }

  if (prioritySelectButton) {
    const profile = multiloginProfileById(prioritySelectButton.dataset.profileId);
    if (profile) {
      nodes.sessionProfileSelect.value = profile.id;
      nodes.operatorProfileSelect.value = profile.id;
      render();
      showToast("Profile selected.");
    }
  }

  if (priorityStartButton) {
    try {
      await startProfileControl(profileFromButton(priorityStartButton));
    } catch (error) {
      showToast(error.message);
    }
  }

  if (priorityOpenXButton) {
    try {
      await openXControl(profileFromButton(priorityOpenXButton));
    } catch (error) {
      showToast(error.message);
    }
  }

  if (priorityViewerButton) {
    try {
      await openViewerControl(profileFromButton(priorityViewerButton));
    } catch (error) {
      showToast(error.message);
    }
  }

  if (priorityQueueButton) {
    try {
      await queueOperatorTask({
        functionId: canRunAndroidCommands() ? "open_x_app" : "open_post_prompt",
        profileId: priorityQueueButton.dataset.profileId,
        targetUrl: nodes.sessionTargetUrl.value,
        notes: canRunAndroidCommands() ? "Open X app from priority board" : "Review manually in the visible phone viewer"
      });
    } catch (error) {
      showToast(error.message);
    }
  }

  if (priorityStopButton) {
    try {
      await stopProfileControl(profileFromButton(priorityStopButton));
    } catch (error) {
      showToast(error.message);
    }
  }

  if (liveAttentionButton) {
    try {
      const profile = profileFromButton(liveAttentionButton);
      const result = await api(`/api/operator/profiles/${encodeURIComponent(profile.id)}/state`, {
        method: "POST",
        body: JSON.stringify({
          profileName: profile.name || "",
          profileType: profile.profileType || "mobile",
          folderId: profile.folderId || "",
          status: "needs_attention",
          issue: "Marked from Live Agent."
        })
      });
      operatorState = result.snapshot;
      render();
      showToast("Marked for attention.");
    } catch (error) {
      showToast(error.message);
    }
  }

  if (manualCommandButton) {
    const runner = manualCommandButton.closest(".manual-command");
    const select = runner?.querySelector(".manual-command-select");
    try {
      manualCommandButton.disabled = true;
      await runManualCommandControl(profileFromButton(manualCommandButton), select?.value || "scroll");
    } catch (error) {
      showToast(error.message);
    } finally {
      manualCommandButton.disabled = false;
    }
  }

  if (assistiveViewerButton) {
    const profile = assistiveProfile();
    try {
      await openViewerControl(profile, { message: "Viewer opened." });
    } catch (error) {
      showToast(error.message);
    }
  }

  if (assistiveCommandButton) {
    const profile = assistiveProfile();
    const command = assistiveCommandButton.dataset.command;
    const draft = document.querySelector("#assistiveDraftText")?.value || "";
    const tapX = Number(document.querySelector("#assistiveTapX")?.value || 50);
    const tapY = Number(document.querySelector("#assistiveTapY")?.value || 50);
    const options = {
      count: Number(assistiveCommandButton.dataset.count || 1),
      text: command === "type_text" ? draft : "",
      xRatio: command === "tap" ? tapX / 100 : undefined,
      yRatio: command === "tap" ? tapY / 100 : undefined
    };

    try {
      localStorage.setItem("telephones.assistiveDraft", draft);
      assistiveCommandButton.disabled = true;
      await runManualCommandControl(profile, command, options);
    } catch (error) {
      showToast(error.message);
    } finally {
      assistiveCommandButton.disabled = false;
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

  if (sessionOverviewSelectButton) {
    const profile = multiloginProfileById(sessionOverviewSelectButton.dataset.profileId);
    if (profile) {
      nodes.sessionProfileSelect.value = profile.id;
      nodes.operatorProfileSelect.value = profile.id;
      render();
      showToast("Profile selected.");
    }
  }

  if (sessionOverviewStopButton) {
    try {
      const result = await api(`/api/operator/sessions/${encodeURIComponent(sessionOverviewStopButton.dataset.sessionId)}/stop`, {
        method: "POST",
        body: JSON.stringify({ notes: "Stopped from Session Overview." })
      });
      operatorState = result.snapshot;
      render();
      const count = result.session?.cleanup?.cancelledTaskCount || 0;
      showToast(`Session stopped. Cleared ${count} task${count === 1 ? "" : "s"}.`);
    } catch (error) {
      showToast(error.message);
    }
  }
});

document.addEventListener("keydown", (event) => {
  const tagName = event.target?.tagName?.toLowerCase();
  if (["input", "select", "textarea", "button"].includes(tagName) || event.metaKey || event.ctrlKey || event.altKey) return;

  const key = event.key.toLowerCase();
  if (key === "n") nodes.openNextProfileButton.click();
  if (key === "d") nodes.sessionPromptDoneButton.click();
  if (key === "s") nodes.sessionPromptSkipButton.click();
  if (key === "a") nodes.sessionPromptAttentionButton.click();
  if (key === "x") nodes.openSessionXButton.click();
  if (key === "c") nodes.cooldownProfileButton.click();
});

loadState().then(() => {
  if (multiloginState?.config.enabled && (multiloginState?.config.hasToken || multiloginState?.config.hasXcli)) {
    loadMultiloginProfiles({ quiet: true });
  }
});
setInterval(() => loadState({ quiet: true }), 3000);
setInterval(() => {
  if (operatorState?.activeSession || selectedSession()) renderSessionConsole();
}, 1000);
setInterval(() => {
  if (multiloginProfilesState.lastLoadedAt) {
    loadMultiloginProfiles({ quiet: true });
  }
}, 15000);
setInterval(() => {
  refreshLiveStatuses({ quiet: true });
}, 5000);
