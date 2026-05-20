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
  guidedWorkPanel: $("#guidedWorkPanel"),
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
  toggleAdvancedButton: $("#toggleAdvancedButton"),
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
let adbSetupText = "";
let advancedToolsVisible = false;
let phoneAutoConnectTimer = null;
let phoneAutoConnectUntil = 0;
let phoneAutoOpenXProfileId = "";
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

function helpTip(text) {
  return `<span class="help-tip" data-tip="${escapeHtml(text)}">?</span>`;
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

function loadLocalJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "");
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let visiblePostState = loadLocalJson("telephones.visiblePosts", {});
let actionHistoryState = Array.isArray(loadLocalJson("telephones.actionHistory", []))
  ? loadLocalJson("telephones.actionHistory", [])
  : [];

function visiblePostForProfile(profileId) {
  return visiblePostState[String(profileId || "")] || null;
}

function rememberVisiblePost(profile, post) {
  const profileId = profile?.id || "";
  const summary = String(post?.summary || post?.message || "").trim();
  if (!profileId || !summary) return null;
  const record = {
    profileId,
    profileName: profile.name || profileId,
    summary,
    actions: post.actions || {},
    checkedAt: new Date().toISOString()
  };
  visiblePostState = {
    ...visiblePostState,
    [profileId]: record
  };
  saveLocalJson("telephones.visiblePosts", visiblePostState);
  return record;
}

function recentVisiblePost(profileId) {
  const post = visiblePostForProfile(profileId);
  if (!post?.checkedAt) return null;
  return Date.now() - new Date(post.checkedAt).getTime() < 2 * 60 * 1000 ? post : null;
}

function appendActionHistory(profile, command, message, post = null) {
  if (!profile?.id) return;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    profileId: profile.id,
    profileName: profile.name || profile.id,
    command,
    message,
    postSummary: post?.summary || visiblePostForProfile(profile.id)?.summary || "",
    createdAt: new Date().toISOString()
  };
  actionHistoryState = [entry, ...actionHistoryState].slice(0, 60);
  saveLocalJson("telephones.actionHistory", actionHistoryState);
}

function actionHistoryForProfile(profileId, limit = 4) {
  return actionHistoryState.filter((entry) => entry.profileId === profileId).slice(0, limit);
}

function compactSummary(value, maxLength = 260) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function buttonTitle(text) {
  return `title="${escapeHtml(text)}" aria-label="${escapeHtml(text)}"`;
}

function canRunAndroidCommands() {
  return Boolean(phoneControlState?.android?.available);
}

function canRunAndroidCommandsForProfile(profileId) {
  if (!canRunAndroidCommands()) return false;
  const devices = phoneControlState?.android?.connectedDevices || [];
  return devices.length <= 1 || Boolean(adbMappings()[profileId]);
}

function androidControlReason() {
  return phoneControlState?.android?.error || "Android in-phone controls need ADB connected to the running cloud phone.";
}

function androidControlReasonForProfile(profileId) {
  if (!canRunAndroidCommands()) return androidControlReason();
  const devices = phoneControlState?.android?.connectedDevices || [];
  if (devices.length > 1 && !adbMappings()[profileId]) return "Multiple Android phones are connected. Choose this profile's phone control device.";
  return "";
}

function adbMappings() {
  try {
    return JSON.parse(localStorage.getItem("telephones.adbMappings") || "{}");
  } catch {
    return {};
  }
}

function setAdbMapping(profileId, serial) {
  const mappings = adbMappings();
  if (serial) mappings[profileId] = serial;
  else delete mappings[profileId];
  localStorage.setItem("telephones.adbMappings", JSON.stringify(mappings));
}

function adbSerialForProfile(profileId) {
  const mapped = adbMappings()[profileId];
  if (mapped) return mapped;
  const devices = phoneControlState?.android?.connectedDevices || [];
  return devices.length === 1 ? devices[0] : "";
}

function looksLikeAdbSetup(text) {
  const value = String(text || "").trim();
  return (
    /\badb\s+connect\s+\S+:\d{2,5}\b/i.test(value) ||
    /\badb\s+-s\s+\S+:\d{2,5}\s+shell\s+\S+/i.test(value) ||
    /\bglogin\s+\S+/i.test(value) ||
    /\bpassword\s*:\s*\S+/i.test(value) ||
    /\b[A-Za-z0-9.-]+:\d{2,5}\b/.test(value) ||
    /^[^\s"'`]{4,80}$/.test(value)
  );
}

async function connectAdbSetupText(inputText, { profile, openXAfterConnect = false } = {}) {
  adbSetupText = String(inputText || "").trim();
  if (!looksLikeAdbSetup(adbSetupText)) {
    throw new Error("Paste the ADB command from Multilogin's green Android icon, for example: adb connect IP:PORT.");
  }

  const result = await api("/api/multilogin/control-status/connect", {
    method: "POST",
    body: JSON.stringify({ commandText: adbSetupText })
  });
  const targetProfile = profile || selectedPhoneControlProfile() || selectedGuidedProfile();
  if (targetProfile?.id && result.serial) setAdbMapping(targetProfile.id, result.serial);
  phoneControlState = result.status;
  stopPhoneAutoConnect();
  render();

  if (openXAfterConnect && targetProfile?.id && canRunAndroidCommandsForProfile(targetProfile.id)) {
    await openXControl(targetProfile);
    return result;
  }

  if (!result.status?.android?.available) {
    showToast(result.status?.android?.error || "ADB connected, but phone control is not authenticated yet.");
    return result;
  }

  showToast(result.authOutput ? "ADB connected and authenticated." : "ADB connected. Run auth command if Multilogin requires it.");
  return result;
}

function stopPhoneAutoConnect() {
  if (phoneAutoConnectTimer) clearInterval(phoneAutoConnectTimer);
  phoneAutoConnectTimer = null;
  phoneAutoConnectUntil = 0;
  phoneAutoOpenXProfileId = "";
}

function selectedPhoneControlProfile() {
  const profile = assistiveProfile();
  return profile?.profileType === "mobile" ? profile : null;
}

function selectedGuidedProfile() {
  const selected = selectedSessionProfile();
  if (selected?.profileType === "mobile") return selected;
  const activeSession = operatorState?.activeSession;
  const activeProfile = activeSession?.profileId ? multiloginProfileById(activeSession.profileId) : null;
  if (activeProfile?.profileType === "mobile") return activeProfile;
  return priorityProfiles().find((row) => row.profile.profileType === "mobile")?.profile || null;
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
              ? renderPhoneControlActionButton(profile, "mlx-open-x")
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

function selectProfileForPhoneControl(profile, { scroll = true } = {}) {
  if (!profile?.id) throw new Error("Select a mobile profile first.");
  if (nodes.sessionProfileSelect) nodes.sessionProfileSelect.value = profile.id;
  if (nodes.operatorProfileSelect) nodes.operatorProfileSelect.value = profile.id;
  render();
  if (scroll) {
    const target = nodes.phoneControlPanel?.closest(".live-agent-panel") || nodes.phoneControlPanel;
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function phoneControlButtonData(profile) {
  return `
    data-profile-id="${escapeHtml(profile.id)}"
    data-profile-name="${escapeHtml(profile.name || "")}"
    data-folder-id="${escapeHtml(profile.folderId)}"
    data-profile-type="mobile"
  `;
}

function renderPhoneControlActionButton(profile, readyClass) {
  if (canRunAndroidCommandsForProfile(profile.id)) {
    return `<button class="secondary ${readyClass}" type="button" ${phoneControlButtonData(profile)}>Open X app</button>`;
  }

  return `<button
    class="secondary phone-control-profile-setup"
    type="button"
    ${phoneControlButtonData(profile)}
    title="${escapeHtml(androidControlReasonForProfile(profile.id))}"
  >Setup control</button>`;
}

function renderManualCommandControls(profile) {
  if (profile?.profileType !== "mobile") return "";
  const androidReady = canRunAndroidCommandsForProfile(profile.id);
  const disabled = androidReady ? "" : "disabled";
  const title = androidReady ? "Runs inside the Android cloud phone." : androidControlReasonForProfile(profile.id);
  return `
    <div class="manual-command" data-profile-id="${escapeHtml(profile.id)}">
      <select class="manual-command-select" aria-label="Manual phone command" ${disabled} title="${escapeHtml(title)}">
        <option value="open_x_app">Open X app</option>
        <option value="scroll_prompt">Scroll review</option>
        <option value="scroll_3">Scroll 3x</option>
        <option value="inspect_visible">Check visible post</option>
        <option value="like_visible">Like visible post</option>
        <option value="save_visible">Save visible post</option>
        <option value="repost_visible">Repost visible post</option>
        <option value="comment_visible">Comment on visible post</option>
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
      ${androidReady ? "" : `<span>${escapeHtml("Setup control first")}</span>`}
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
  const canOpenSessionX = Boolean(profile?.id && profile.profileType === "mobile" && canRunAndroidCommandsForProfile(profile.id));
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
  nodes.openSessionXButton.disabled = !canOpenSessionX;
  nodes.openSessionXButton.title =
    profile?.profileType === "mobile" ? androidControlReasonForProfile(profile.id) || "Open the installed Android X app." : "Select a mobile profile first.";
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

  if (!advancedToolsVisible) {
    nodes.priorityBoard.innerHTML = rows
      .slice(0, 6)
      .map(({ profile, record, status }) => {
        const selected = selectedGuidedProfile()?.id === profile.id;
        const facts = [
          profile.serialNumber ? `Serial ${profile.serialNumber}` : "",
          record?.lastStartedAt ? `Started ${formatRelative(record.lastStartedAt)}` : "",
          record?.autoStopAt && ["running", "starting", "prepared"].includes(status) ? `Auto-stop ${formatFuture(record.autoStopAt)}` : "",
          record?.issue ? record.issue : ""
        ].filter(Boolean);
        return `
          <article class="priority-card simple ${selected ? "selected" : ""}">
            <header>
              <div>
                <strong>${escapeHtml(profile.name || profile.id)}</strong>
                <p>${escapeHtml(profile.profileType === "mobile" ? "Mobile cloud phone" : "Browser profile")}</p>
              </div>
              <span class="tag ${escapeHtml(status)}">${escapeHtml(selected ? "selected" : status.replaceAll("_", " "))}</span>
            </header>
            <div class="priority-meta">
              ${facts.length ? facts.map((item) => `<span>${escapeHtml(item)}</span>`).join("") : `<span>Ready</span>`}
            </div>
            <footer>
              <button class="secondary priority-select-profile" type="button" data-profile-id="${escapeHtml(profile.id)}">Select this phone</button>
            </footer>
          </article>
        `;
      })
      .join("");
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
                ? renderPhoneControlActionButton(profile, "priority-open-x")
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
  const action = actionHistoryForProfile(profileId, 1)[0];
  if (action) return `${action.message} ${formatRelative(action.createdAt)}`;
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

function renderGuidedWorkPanel() {
  if (!nodes.guidedWorkPanel) return;

  if (!operatorState || !multiloginState) {
    nodes.guidedWorkPanel.innerHTML = `<p class="empty">Loading your profiles...</p>`;
    return;
  }

  const mobileProfiles = priorityProfiles()
    .filter((row) => row.profile.profileType === "mobile")
    .map((row) => row.profile);
  const selectedProfile = selectedGuidedProfile();
  const selectedProfileId = selectedProfile?.id || "";
  const record = selectedProfile ? profileRecord(selectedProfile.id) : null;
  const status = selectedProfile ? effectiveProfileStatus(selectedProfile) : "";
  const isRunning = ["running", "starting", "prepared"].includes(status);
  const androidReady = Boolean(selectedProfile?.id && canRunAndroidCommandsForProfile(selectedProfile.id));
  const autoConnecting = selectedProfile?.id === phoneAutoOpenXProfileId || phoneAutoConnectUntil > Date.now();
  const multiloginReady = Boolean(multiloginState.config.enabled && (multiloginState.config.hasToken || multiloginState.config.hasXcli));
  const profileOptions = mobileProfiles
    .map(
      (profile) =>
        `<option value="${escapeHtml(profile.id)}" ${profile.id === selectedProfileId ? "selected" : ""}>${escapeHtml(
          `${profile.name || profile.id}${profile.serialNumber ? ` | ${profile.serialNumber}` : ""}`
        )}</option>`
    )
    .join("");

  if (!multiloginReady) {
    nodes.liveAgentSummary.textContent = "Multilogin is not enabled";
    nodes.guidedWorkPanel.innerHTML = `
      <article class="guided-card blocked">
        <div>
          <span class="guided-step">Setup needed</span>
          <h3>Connect Multilogin first</h3>
          <p>The dashboard needs the Multilogin token or local xcli before it can see your cloud phones.</p>
        </div>
        <button id="multiloginProfilesButtonProxy" class="secondary guided-sync" type="button">Sync Profiles</button>
      </article>
    `;
    return;
  }

  if (!mobileProfiles.length) {
    nodes.liveAgentSummary.textContent = "No synced mobile profiles";
    nodes.guidedWorkPanel.innerHTML = `
      <article class="guided-card">
        <div>
          <span class="guided-step">Step 1</span>
          <h3>Sync your Multilogin phones</h3>
          <p>This loads the two mobile profiles you want to control.</p>
        </div>
        <button class="guided-sync" type="button">Sync Profiles</button>
      </article>
    `;
    return;
  }

  const statusText = androidReady
    ? "Ready: X app and scroll controls can run from this page."
    : isRunning
      ? autoConnecting
        ? "Waiting for Multilogin ADB details. When they appear on the Mac clipboard, X opens automatically."
        : "Phone is open. Enable/copy ADB from Multilogin once, then this page will connect."
      : "Ready to start. This opens the phone viewer and starts the automatic connector.";
  const issueText = record?.issue ? `<p class="guided-warning">${escapeHtml(record.issue)}</p>` : "";
  const lastReport = selectedProfile ? latestProfileReport(selectedProfile.id) : "No report yet.";
  const currentPost = selectedProfile ? visiblePostForProfile(selectedProfile.id) : null;
  const currentPostIsRecent = Boolean(selectedProfile && recentVisiblePost(selectedProfile.id));
  const recentActions = selectedProfile ? actionHistoryForProfile(selectedProfile.id, 3) : [];
  const startDisabled = selectedProfile ? "" : "disabled";
  const androidDisabled = androidReady ? "" : "disabled";
  const androidError = phoneControlState?.android?.error || "";
  const guidedCommentDraft = localStorage.getItem("telephones.commentDraft") || "";
  const rawAdbDevices = phoneControlState?.android?.devices || [];
  const adbDeviceSummary = rawAdbDevices.length
    ? rawAdbDevices.map((device) => `${device.serial || "unknown"} ${device.status || ""}`.trim()).join(", ")
    : "";
  const adbNeededText =
    "Phone viewer is open, but Step 3 needs ADB control. In the Multilogin profile list, enable ADB for this running phone, then copy the command from the green Android icon once.";
  const controlText = androidReady
    ? `Ready. Last report: ${lastReport}`
    : adbDeviceSummary
      ? `${adbNeededText} Current ADB status: ${adbDeviceSummary}.`
      : adbNeededText;
  const assistLabel = !isRunning
    ? "Assist me: start phone"
    : !androidReady
      ? "Assist me: connect phone"
      : currentPostIsRecent
        ? "Assist me: next post"
        : "Assist me: open X + check post";
  const assistHelp = !isRunning
    ? "Starts the selected phone, opens the visible viewer, and starts watching for phone control."
    : !androidReady
      ? "Opens the viewer and starts the automatic connector. Copy the Multilogin ADB code once if needed."
      : "Opens X if needed, scrolls safely, then checks the visible post so you can decide what to do.";

  nodes.liveAgentSummary.textContent = selectedProfile
    ? `${selectedProfile.name || selectedProfile.id} | ${statusText}`
    : "Choose a phone";

  nodes.guidedWorkPanel.innerHTML = `
    <article class="guided-card ${selectedProfile ? "ready" : ""}">
      <header class="guided-card-header">
        <span class="step-number">1</span>
        <div>
          <h3>Choose phone ${helpTip("Pick the Multilogin cloud phone you want to use right now. This does not start anything by itself.")}</h3>
          <p>Select one of your real mobile profiles. The rest of the page will control this phone.</p>
        </div>
      </header>
      <div class="guided-profile-row">
        <label>
          Phone
          <select class="guided-profile-select">
            ${profileOptions}
          </select>
        </label>
        <span class="tag ${escapeHtml(status || "ready")}">${escapeHtml((status || "ready").replaceAll("_", " "))}</span>
      </div>
      <div class="guided-facts">
        <span>Serial ${escapeHtml(selectedProfile?.serialNumber || "unknown")}</span>
        ${record?.lastStartedAt ? `<span>Started ${escapeHtml(formatRelative(record.lastStartedAt))}</span>` : ""}
        ${record?.autoStopAt && isRunning ? `<span>Auto-stop ${escapeHtml(formatFuture(record.autoStopAt))}</span>` : ""}
        ${record?.issue ? `<span>${escapeHtml(record.issue)}</span>` : ""}
      </div>
    </article>

    <article class="guided-card ${androidReady ? "ready" : isRunning ? "running" : ""}">
      <header class="guided-card-header">
        <span class="step-number">2</span>
        <div>
          <h3>Start and connect ${helpTip("Start My X Session opens the visible Multilogin phone and starts the automatic connector. If Step 3 stays locked, enable ADB in the Multilogin profile list and copy the green Android icon command once.")}</h3>
          <p>${escapeHtml(statusText)}</p>
        </div>
      </header>
      ${issueText}
      <div class="guided-assist-strip">
        <button class="guided-assist-next" type="button" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle(assistHelp)} ${startDisabled}>${escapeHtml(assistLabel)}</button>
        <p>${escapeHtml(assistHelp)}</p>
      </div>
      <div class="guided-actions three">
        <button class="guided-start-session" type="button" data-profile-id="${escapeHtml(selectedProfileId)}" ${startDisabled}>Start My X Session</button>
        <button class="secondary guided-viewer" type="button" data-profile-id="${escapeHtml(selectedProfileId)}" ${startDisabled}>Open Viewer</button>
        <button class="secondary guided-auto-connect" type="button" data-profile-id="${escapeHtml(selectedProfileId)}" ${startDisabled}>${autoConnecting ? "Waiting for ADB" : "Auto-connect"}</button>
      </div>
      <div class="guided-facts">
        <span>${escapeHtml(androidReady ? "Phone control connected" : "Phone control not connected")}</span>
        <span>${escapeHtml(autoConnecting ? "Watching Mac clipboard" : "Connector idle")}</span>
        ${androidError && !androidReady ? `<span>${escapeHtml(androidError)}</span>` : ""}
      </div>
      ${
        androidReady
          ? ""
          : `
            <form id="guidedAdbConnectForm" class="guided-adb-form">
              <label>
                ADB code from Multilogin
                <textarea id="guidedAdbSetupText" rows="2" placeholder="${escapeHtml("adb connect IP:PORT\nadb -s IP:PORT shell glogin PASSWORD")}">${escapeHtml(
                  adbSetupText
                )}</textarea>
              </label>
              <p class="guided-adb-hint">You can paste the Auth command only. If the popup only shows a password, paste just the password.</p>
              <div class="button-row inline">
                <button class="secondary guided-adb-paste" type="button">Paste code</button>
                <button type="submit">Connect + Open X</button>
              </div>
            </form>
          `
      }
    </article>

    <article class="guided-card ${androidReady ? "ready" : "blocked"}">
      <header class="guided-card-header">
        <span class="step-number">3</span>
        <div>
          <h3>Use X ${helpTip("Use these controls after Step 2 is connected. You can open a profile by handle, check the visible post, and comment with your exact text.")}</h3>
          <p>${escapeHtml(controlText)}</p>
        </div>
      </header>
      <div class="guided-simple-actions">
        <label>
          Open X profile
          <input id="guidedXProfileTarget" type="text" placeholder="@profile or x.com/profile" autocomplete="off" />
        </label>
        <button class="guided-open-profile" type="button" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Open this X profile inside the Android X app.")} ${androidDisabled}>Open profile</button>
        <button class="secondary guided-scroll-check" type="button" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Scroll once, then check and store the visible post text.")} ${androidDisabled}>Scroll + Check</button>
      </div>
      <div class="guided-current-post ${currentPost ? "has-post" : ""}">
        <div>
          <strong>Current post ${helpTip("Press Check post when a post is visible. The dashboard stores the detected post text here so you can verify before acting.")}</strong>
          <p>${escapeHtml(currentPost ? compactSummary(currentPost.summary, 360) : "No post checked yet.")}</p>
        </div>
        <span>${escapeHtml(currentPost ? `${currentPostIsRecent ? "recent" : "old"} | ${formatRelative(currentPost.checkedAt)}` : "check first")}</span>
      </div>
      <div class="guided-control-sections">
        <section class="guided-control-group">
          <header>
            <strong>Move</strong>
            <span>${helpTip("Open X launches the Android app. Scroll moves the visible feed.")}</span>
          </header>
          <div class="guided-actions control">
            <button class="secondary guided-open-x" type="button" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Open the installed Android X app on this phone.")} ${androidDisabled}>Open X</button>
            <button class="secondary guided-scroll" type="button" data-command="scroll_prompt" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Scroll the X feed once.")} ${androidDisabled}>Scroll</button>
            <button class="secondary guided-scroll" type="button" data-command="scroll_3" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Scroll the X feed three times.")} ${androidDisabled}>Scroll 3x</button>
          </div>
        </section>
        <section class="guided-control-group">
          <header>
            <strong>Visible post</strong>
            <span>${helpTip("These buttons act on the post currently visible in the phone viewer. Check post first when possible.")}</span>
          </header>
          <div class="guided-actions control">
            <button class="secondary guided-post-action" type="button" data-command="inspect_visible" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Read the currently visible post text into this dashboard.")} ${androidDisabled}>Check post</button>
            <button class="secondary guided-post-action" type="button" data-command="like_visible" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Tap Like on the currently visible X post.")} ${androidDisabled}>Like</button>
            <button class="secondary guided-post-action" type="button" data-command="save_visible" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Save the currently visible X post to Bookmarks.")} ${androidDisabled}>Save</button>
            <button class="secondary guided-post-action" type="button" data-command="repost_visible" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Repost the visible post after confirmation.")} ${androidDisabled}>Repost</button>
          </div>
        </section>
        <section class="guided-control-group comment-group">
          <header>
            <strong>Comment</strong>
            <span>${helpTip("Write the exact text you want posted. The dashboard will ask for confirmation before submitting.")}</span>
          </header>
          <div class="guided-ai-helper">
            <label>
              What do you want to say?
              <textarea id="aiDraftIntent" rows="2" placeholder="Example: agree warmly, ask a question, thank them, or write a quote-post thought."></textarea>
            </label>
            <label>
              Style
              <select id="aiDraftTone">
                <option value="natural">Natural</option>
                <option value="short">Short</option>
                <option value="warm">Warm</option>
                <option value="thoughtful">Thoughtful</option>
                <option value="funny">Light/funny</option>
              </select>
            </label>
            <div class="button-row inline">
              <button class="secondary ai-draft-action" type="button" data-mode="reply" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Use AI to draft a reply from the checked post and your intention.")}>AI reply</button>
              <button class="secondary ai-draft-action" type="button" data-mode="quote" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Use AI to draft text you can use when resharing or quote-posting.")}>AI reshare text</button>
              <button class="secondary ai-draft-action" type="button" data-mode="rewrite" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Rewrite the current comment draft in the selected style.")}>Improve draft</button>
            </div>
            <p>AI only writes a draft. You still approve it before anything is posted.</p>
          </div>
          <div class="guided-comment-form">
            <label>
              Comment exact text
              <textarea id="guidedCommentText" rows="2" placeholder="Write the exact comment you want posted.">${escapeHtml(guidedCommentDraft)}</textarea>
            </label>
            <button class="guided-post-action" type="button" data-command="comment_visible" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Reply to the currently visible post using this exact text.")} ${androidDisabled}>Comment exact text</button>
          </div>
        </section>
        <section class="guided-control-group">
          <header>
            <strong>Phone</strong>
            <span>${helpTip("Use these when X is on the wrong screen or you need evidence of what the phone sees.")}</span>
          </header>
          <div class="guided-actions control">
            <button class="secondary guided-screenshot" type="button" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Capture a screenshot from the connected Android phone.")} ${androidDisabled}>Screenshot</button>
            <button class="secondary guided-back" type="button" data-command="key_back" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Send Android Back.")} ${androidDisabled}>Back</button>
            <button class="secondary guided-home" type="button" data-command="key_home" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Send Android Home.")} ${androidDisabled}>Home</button>
            <button class="secondary guided-stop" type="button" data-profile-id="${escapeHtml(selectedProfileId)}" ${buttonTitle("Stop this Multilogin phone session and clear queued work for it.")} ${startDisabled}>Stop</button>
          </div>
        </section>
      </div>
      <div class="guided-action-history">
        <strong>Last actions ${helpTip("Every button report appears here, so you can see what was completed.")}</strong>
        ${
          recentActions.length
            ? recentActions
                .map((item) => `<p>${escapeHtml(item.message)} <span>${escapeHtml(formatRelative(item.createdAt))}</span></p>`)
                .join("")
            : `<p>No actions recorded for this phone yet.</p>`
        }
      </div>
    </article>
  `;
}

function renderPhoneControlPanel() {
  if (!nodes.phoneControlPanel) return;

  if (!phoneControlState) {
    nodes.phoneControlPanel.innerHTML = `<p class="empty">Checking phone control capabilities...</p>`;
    return;
  }

  const multiloginReady = phoneControlState.multilogin?.available;
  const adbDevices = phoneControlState.android?.connectedDevices || [];
  const adbDeviceText = adbDevices.length ? adbDevices.join(", ") : "No connected Android phone";
  const adbError = phoneControlState.android?.error || "";
  const profile = selectedPhoneControlProfile();
  const profileLabel = profile ? `${profile.name || profile.id}${profile.serialNumber ? ` | Serial ${profile.serialNumber}` : ""}` : "No mobile profile selected";
  const setupPlaceholder = `adb connect IP:PORT\nadb -s IP:PORT shell glogin PASSWORD`;
  const setupDisabled = profile ? "" : "disabled";
  const profileAndroidReady = Boolean(profile?.id && canRunAndroidCommandsForProfile(profile.id));
  const androidDisabled = profileAndroidReady ? "" : "disabled";
  const autoConnecting = phoneAutoConnectUntil > Date.now();

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
    <article class="phone-control-card phone-control-setup ${profileAndroidReady ? "ready" : "blocked"}">
      <header>
        <div>
          <strong>Inside-phone controls</strong>
          <p>${escapeHtml(profileLabel)}</p>
        </div>
        <span class="tag ${profileAndroidReady ? "ready" : "problem"}">${profileAndroidReady ? "ready" : "connect phone control"}</span>
      </header>
      <div class="phone-control-meta">
        <span>${escapeHtml(adbDeviceText)}</span>
        ${adbError ? `<span>${escapeHtml(adbError)}</span>` : ""}
      </div>

      <div class="phone-control-actions">
        <button class="phone-control-viewer" type="button" ${setupDisabled}>Open selected phone</button>
        <button id="phoneAutoConnectButton" class="secondary" type="button" ${setupDisabled}>${autoConnecting ? "Watching clipboard..." : "Auto-connect"}</button>
        <button id="adbRefreshButton" class="secondary" type="button">Refresh status</button>
      </div>

      <p class="phone-control-hint">${escapeHtml(
        profileAndroidReady
          ? "Phone control is ready. Use Open X app, Scroll, Screenshot, or Type Draft below."
          : autoConnecting
            ? "Watching the Mac clipboard. When Multilogin copies the ADB command, this dashboard will connect automatically."
            : "Click Open selected phone, enable ADB in Multilogin, then click Auto-connect. The dashboard watches the Mac clipboard for the ADB command."
      )}</p>

      <details class="manual-adb-details">
        <summary>Manual ADB fallback</summary>
        <form id="adbConnectForm" class="adb-connect-form">
          <label>
            Multilogin ADB commands
            <textarea id="adbSetupText" rows="2" placeholder="${escapeHtml(setupPlaceholder)}">${escapeHtml(adbSetupText)}</textarea>
          </label>
          <div class="button-row inline">
            <button id="adbPasteButton" class="secondary" type="button">Paste clipboard</button>
            <button type="submit">Connect + verify</button>
          </div>
        </form>
      </details>

      <div class="button-row inline">
        <button id="phoneControlTestButton" class="secondary" type="button" ${androidDisabled}>Test screenshot</button>
        <button id="phoneControlOpenXButton" class="secondary" type="button" ${androidDisabled}>Open X app</button>
      </div>

      <div class="phone-control-steps">
        <span class="${multiloginReady ? "done" : ""}">1 Multilogin ready</span>
        <span class="${profile ? "done" : ""}">2 Phone selected</span>
        <span class="${profileAndroidReady ? "done" : ""}">3 Phone control connected</span>
      </div>
    </article>
  `;
}

function renderAssistiveController() {
  if (!nodes.assistiveController) return;

  const profile = assistiveProfile();
  const androidReady = canRunAndroidCommandsForProfile(profile?.id);
  const androidAttrs = androidReady ? "" : `disabled title="${escapeHtml(androidControlReasonForProfile(profile?.id))}"`;
  const devices = phoneControlState?.android?.connectedDevices || [];
  const mappedSerial = profile ? adbSerialForProfile(profile.id) : "";
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
        <span class="tag ${androidReady ? "ready" : "problem"}">${androidReady ? "phone control ready" : "connect phone control"}</span>
      </header>

      ${
        androidReady
          ? ""
          : `<div class="assistive-warning">
              Open the selected phone, enable ADB in Multilogin, then paste the ADB commands into Phone Control.
            </div>`
      }

      <div class="assistive-device-row">
        <label>
          Phone control device
          <select class="assistive-adb-select" ${devices.length ? "" : "disabled"}>
            <option value="">${devices.length ? "Auto / single device" : "No ADB device connected"}</option>
            ${devices.map((device) => `<option value="${escapeHtml(device)}" ${device === mappedSerial ? "selected" : ""}>${escapeHtml(device)}</option>`).join("")}
          </select>
        </label>
      </div>

      <div class="assistive-actions">
        <button class="assistive-viewer" type="button" data-profile-id="${escapeHtml(profile.id)}">Open Viewer</button>
        <button class="secondary assistive-command" type="button" data-command="open_x_app" ${androidAttrs}>Open X</button>
        <button class="secondary assistive-command" type="button" data-command="scroll_prompt" data-count="1" ${androidAttrs}>Scroll</button>
        <button class="secondary assistive-command" type="button" data-command="scroll_3" data-count="3" ${androidAttrs}>Scroll 3x</button>
        <button class="secondary assistive-command" type="button" data-command="inspect_visible" ${androidAttrs}>Check post</button>
        <button class="secondary assistive-command" type="button" data-command="like_visible" ${androidAttrs}>Like post</button>
        <button class="secondary assistive-command" type="button" data-command="save_visible" ${androidAttrs}>Save post</button>
        <button class="secondary assistive-command" type="button" data-command="repost_visible" ${androidAttrs}>Repost</button>
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
        <button class="assistive-command" type="button" data-command="comment_visible" ${androidAttrs}>Comment</button>
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
                ? renderPhoneControlActionButton(profile, "priority-open-x")
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
  document.querySelectorAll(".advanced-panel").forEach((node) => {
    node.hidden = !advancedToolsVisible;
  });
  if (nodes.toggleAdvancedButton) {
    nodes.toggleAdvancedButton.textContent = advancedToolsVisible ? "Hide advanced" : "Advanced tools";
    nodes.toggleAdvancedButton.setAttribute("aria-pressed", advancedToolsVisible ? "true" : "false");
  }
  renderOptions();
  renderMetrics();
  renderProfiles();
  renderPostQueue();
  renderSavedItems();
  renderEvents();
  renderAgents();
  renderAccountsTable();
  renderOtpQueue();
  renderGuidedWorkPanel();
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
    openX: profile.profileType === "mobile" && canRunAndroidCommandsForProfile(profile.id),
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
  if (profile.profileType === "mobile" && !canRunAndroidCommandsForProfile(profile.id)) {
    startPhoneAutoConnect(profile, { openXOnReady: true });
  }
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
  showToast(warning ? "Phone viewer requested. If the phone window is visible, continue." : message);
  return result;
}

async function openXControl(profile, { message = "Opened Android X app." } = {}) {
  if (!profile?.id) throw new Error("Select a profile first.");
  if (!canRunAndroidCommandsForProfile(profile.id)) {
    selectProfileForPhoneControl(profile);
    throw new Error(androidControlReasonForProfile(profile.id) || "Connect phone control before opening X from the dashboard.");
  }

  const result = await api(`/api/multilogin/profiles/${encodeURIComponent(profile.id)}/open-x`, {
    method: "POST",
    body: JSON.stringify({
      profileName: profile.name || "",
      profileType: profile.profileType || "mobile",
      folderId: profile.folderId || "",
      adbSerial: adbSerialForProfile(profile.id),
      runUiMacro: false
    })
  });
  if (result.snapshot) operatorState = result.snapshot;
  await loadMultiloginProfiles({ quiet: true });
  const warning = result.response?.payload?.viewerWarning || result.response?.payload?.macroWarning || result.response?.payload?.installWarning;
  showToast(warning ? "X app launch returned a warning. Check Live Agent." : message);
  return result;
}

async function scrollAndCheckPost(profile, { count = 1 } = {}) {
  if (!profile?.id) throw new Error("Select a phone first.");
  if (Number(count || 0) > 0) {
    await runManualCommandControl(profile, count > 1 ? "scroll_3" : "scroll_prompt");
    await new Promise((resolve) => setTimeout(resolve, 650));
  }
  return runManualCommandControl(profile, "inspect_visible");
}

async function generateAiDraftForProfile(profile, mode) {
  if (!profile?.id) throw new Error("Select a phone first.");
  const post = visiblePostForProfile(profile.id);
  const intentField = document.querySelector("#aiDraftIntent");
  const commentField = document.querySelector("#guidedCommentText");
  const tone = document.querySelector("#aiDraftTone")?.value || "natural";
  const intent = String(intentField?.value || "").trim();
  const existingDraft = String(commentField?.value || "").trim();
  const body = {
    mode,
    tone,
    postSummary: post?.summary || "",
    intent: mode === "rewrite" ? existingDraft || intent : intent || existingDraft
  };
  if (!body.postSummary && !body.intent) {
    throw new Error("Check a post or write your idea first.");
  }
  const result = await api("/api/ai/draft", {
    method: "POST",
    body: JSON.stringify(body)
  });
  if (commentField) {
    commentField.value = result.draft || "";
    localStorage.setItem("telephones.commentDraft", commentField.value);
  }
  appendActionHistory(profile, `ai_${mode}`, `AI drafted ${mode === "quote" ? "reshare text" : "reply text"}.`, post);
  render();
  showToast("AI draft ready. Review it before posting.");
  return result;
}

async function runAssistedNextStep(profile) {
  if (!profile?.id) {
    if (!multiloginProfilesState.profiles.length) {
      await loadMultiloginProfiles();
    }
    const firstPhone = multiloginProfilesState.profiles.find((item) => item.profileType === "mobile");
    if (firstPhone) {
      nodes.sessionProfileSelect.value = firstPhone.id;
      nodes.operatorProfileSelect.value = firstPhone.id;
      profile = firstPhone;
      render();
    }
  }

  if (!profile?.id) throw new Error("Sync profiles, then choose a phone.");
  selectProfileForPhoneControl(profile, { scroll: false });

  const status = effectiveProfileStatus(profile);
  const isRunning = ["running", "starting", "prepared"].includes(status);
  if (!isRunning) {
    await startProfileControl(profile, { message: "Started. I am watching for phone control." });
    return "Started the phone and started watching for phone control.";
  }

  if (!canRunAndroidCommandsForProfile(profile.id)) {
    await openViewerControl(profile, { message: "Viewer opened. I am watching for the ADB code." });
    startPhoneAutoConnect(profile, { openXOnReady: true });
    return "Opened the viewer and started watching for the ADB code.";
  }

  await openXControl(profile, { message: "Opened X. Now checking the next post." });
  await scrollAndCheckPost(profile, { count: recentVisiblePost(profile.id) ? 1 : 0 });
  return "Opened X and checked the visible post. You can now choose Like, Save, Repost, or Comment.";
}

async function tryPhoneAutoConnect(profile, { quiet = false } = {}) {
  const result = await api("/api/multilogin/control-status/auto-connect", {
    method: "POST",
    body: JSON.stringify({ profileId: profile?.id || "" })
  });
  phoneControlState = result.status;
  if (profile?.id && result.serial) setAdbMapping(profile.id, result.serial);
  render();

  if (result.status?.android?.available) {
    stopPhoneAutoConnect();
    if (!quiet) showToast("Phone control connected.");
    return true;
  }

  if (!quiet) showToast(result.message || result.error || "Waiting for ADB command in clipboard.");
  return false;
}

function startPhoneAutoConnect(profile, { openXOnReady = false } = {}) {
  if (!profile?.id) throw new Error("Select a mobile profile first.");
  phoneAutoConnectUntil = Date.now() + 120000;
  phoneAutoOpenXProfileId = openXOnReady ? profile.id : "";
  if (phoneAutoConnectTimer) clearInterval(phoneAutoConnectTimer);
  showToast("Watching Mac clipboard for Multilogin ADB command.");
  render();

  const tick = async () => {
    if (Date.now() > phoneAutoConnectUntil) {
      stopPhoneAutoConnect();
      render();
      showToast("Auto-connect timed out. Copy the ADB command from Multilogin and try again.");
      return;
    }
    try {
      const connected = await tryPhoneAutoConnect(profile, { quiet: true });
      if (connected && openXOnReady) {
        await openXControl(profile, { message: "Phone control connected. Opened X." });
      }
    } catch (error) {
      if (!/clipboard|adb command|IP:PORT|Waiting/i.test(error.message)) showToast(error.message);
    }
  };

  tick();
  phoneAutoConnectTimer = setInterval(tick, 2500);
}

async function runManualCommandControl(profile, command, options = {}) {
  if (!profile?.id) throw new Error("Select a profile first.");
  if (profile.profileType !== "mobile") throw new Error("Manual phone commands are only available for mobile profiles.");
  if (!canRunAndroidCommandsForProfile(profile.id)) throw new Error(androidControlReasonForProfile(profile.id));
  const commandOptions = { ...options };
  if (command === "comment_visible") {
    const draft = String(
      commandOptions.text ??
        document.querySelector("#guidedCommentText")?.value ??
        document.querySelector("#assistiveDraftText")?.value ??
        localStorage.getItem("telephones.commentDraft") ??
        ""
    ).trim();
    if (!draft) throw new Error("Write the exact comment text first.");
    const checkedPost = recentVisiblePost(profile.id);
    const postContext = checkedPost
      ? `\n\nChecked post:\n${compactSummary(checkedPost.summary, 420)}`
      : "\n\nNo recent post check is saved. Use Check post first if you want to verify the target.";
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Post this exact comment to the currently visible X post?${postContext}\n\nComment:\n${draft}`)
    ) {
      showToast("Comment cancelled.");
      return null;
    }
    localStorage.setItem("telephones.commentDraft", draft);
    commandOptions.text = draft;
  }
  if (command === "open_x_profile") {
    const target = String(commandOptions.target || "").trim();
    if (!target) throw new Error("Enter the X profile handle first, for example @openai.");
    commandOptions.target = target;
  }
  if (
    command === "repost_visible" &&
    typeof window !== "undefined" &&
    !window.confirm(
      `Repost the currently visible X post on this account?${
        recentVisiblePost(profile.id) ? `\n\nChecked post:\n${compactSummary(recentVisiblePost(profile.id).summary, 420)}` : "\n\nUse Check post first if you want to verify the target."
      }`
    )
  ) {
    showToast("Repost cancelled.");
    return null;
  }

  const result = await api(`/api/multilogin/profiles/${encodeURIComponent(profile.id)}/command`, {
    method: "POST",
    body: JSON.stringify({
      profileName: profile.name || "",
      profileType: profile.profileType || "mobile",
      folderId: profile.folderId || "",
      adbSerial: commandOptions.adbSerial || adbSerialForProfile(profile.id),
      command,
      ...commandOptions
    })
  });
  if (result.snapshot) operatorState = result.snapshot;
  const payload = result.response?.payload || {};
  const rememberedPost = payload.post ? rememberVisiblePost(profile, payload.post) : null;
  assistiveLastReport = {
    profileId: profile.id,
    message: payload.message || `${result.commandLabel || "Command"} completed.`,
    image: payload.imageBase64 ? `data:${payload.imageMime || "image/png"};base64,${payload.imageBase64}` : null,
    at: result.requestedAt || new Date().toISOString()
  };
  appendActionHistory(profile, command, assistiveLastReport.message, rememberedPost);
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
  const toggleAdvancedButton = event.target.closest("#toggleAdvancedButton");
  const mlxStartButton = event.target.closest(".mlx-start-profile");
  const mlxOpenViewerButton = event.target.closest(".mlx-open-viewer");
  const mlxOpenXButton = event.target.closest(".mlx-open-x");
  const mlxStopButton = event.target.closest(".mlx-stop-profile");
  const phoneControlProfileSetupButton = event.target.closest(".phone-control-profile-setup");
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
  const phoneControlViewerButton = event.target.closest(".phone-control-viewer");
  const phoneAutoConnectButton = event.target.closest("#phoneAutoConnectButton");
  const phoneControlTestButton = event.target.closest("#phoneControlTestButton");
  const phoneControlOpenXButton = event.target.closest("#phoneControlOpenXButton");
  const adbPasteButton = event.target.closest("#adbPasteButton");
  const adbRefreshButton = event.target.closest("#adbRefreshButton");
  const guidedSyncButton = event.target.closest(".guided-sync");
  const guidedAssistButton = event.target.closest(".guided-assist-next");
  const guidedStartButton = event.target.closest(".guided-start-session");
  const guidedViewerButton = event.target.closest(".guided-viewer");
  const guidedAutoConnectButton = event.target.closest(".guided-auto-connect");
  const guidedOpenXButton = event.target.closest(".guided-open-x");
  const guidedOpenProfileButton = event.target.closest(".guided-open-profile");
  const guidedScrollButton = event.target.closest(".guided-scroll");
  const guidedScrollCheckButton = event.target.closest(".guided-scroll-check");
  const guidedPostActionButton = event.target.closest(".guided-post-action");
  const aiDraftButton = event.target.closest(".ai-draft-action");
  const guidedScreenshotButton = event.target.closest(".guided-screenshot");
  const guidedBackButton = event.target.closest(".guided-back");
  const guidedHomeButton = event.target.closest(".guided-home");
  const guidedStopButton = event.target.closest(".guided-stop");
  const guidedAdbPasteButton = event.target.closest(".guided-adb-paste");

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

  if (toggleAdvancedButton) {
    advancedToolsVisible = !advancedToolsVisible;
    render();
    showToast(advancedToolsVisible ? "Advanced tools shown." : "Advanced tools hidden.");
  }

  if (guidedSyncButton) {
    try {
      await loadMultiloginProfiles();
    } catch (error) {
      showToast(error.message);
    }
  }

  if (guidedAssistButton) {
    try {
      const profile = multiloginProfileById(guidedAssistButton.dataset.profileId) || selectedGuidedProfile();
      guidedAssistButton.disabled = true;
      const message = await runAssistedNextStep(profile);
      showToast(message);
    } catch (error) {
      showToast(error.message);
    } finally {
      guidedAssistButton.disabled = false;
    }
  }

  if (guidedStartButton) {
    try {
      const profile = multiloginProfileById(guidedStartButton.dataset.profileId) || selectedGuidedProfile();
      selectProfileForPhoneControl(profile, { scroll: false });
      await startProfileControl(profile, { message: "Started. Auto-connect is watching." });
    } catch (error) {
      showToast(error.message);
    }
  }

  if (guidedViewerButton) {
    try {
      const profile = multiloginProfileById(guidedViewerButton.dataset.profileId) || selectedGuidedProfile();
      selectProfileForPhoneControl(profile, { scroll: false });
      await openViewerControl(profile, { message: "Viewer opened." });
      if (profile?.profileType === "mobile" && !canRunAndroidCommandsForProfile(profile.id)) {
        startPhoneAutoConnect(profile, { openXOnReady: true });
      }
    } catch (error) {
      showToast(error.message);
    }
  }

  if (guidedAutoConnectButton) {
    try {
      const profile = multiloginProfileById(guidedAutoConnectButton.dataset.profileId) || selectedGuidedProfile();
      selectProfileForPhoneControl(profile, { scroll: false });
      startPhoneAutoConnect(profile, { openXOnReady: true });
    } catch (error) {
      showToast(error.message);
    }
  }

  if (guidedAdbPasteButton) {
    try {
      if (!navigator.clipboard?.readText) throw new Error("Clipboard paste is not available in this browser.");
      adbSetupText = await navigator.clipboard.readText();
      const textArea = document.querySelector("#guidedAdbSetupText");
      const advancedTextArea = document.querySelector("#adbSetupText");
      if (textArea) textArea.value = adbSetupText;
      if (advancedTextArea) advancedTextArea.value = adbSetupText;
      showToast(adbSetupText ? "ADB code pasted. Click Connect + Open X." : "Clipboard is empty.");
    } catch (error) {
      showToast(error.message);
    }
  }

  if (guidedOpenXButton) {
    try {
      const profile = multiloginProfileById(guidedOpenXButton.dataset.profileId) || selectedGuidedProfile();
      await openXControl(profile);
    } catch (error) {
      showToast(error.message);
    }
  }

  if (guidedOpenProfileButton) {
    try {
      const profile = multiloginProfileById(guidedOpenProfileButton.dataset.profileId) || selectedGuidedProfile();
      const target = document.querySelector("#guidedXProfileTarget")?.value || "";
      guidedOpenProfileButton.disabled = true;
      await runManualCommandControl(profile, "open_x_profile", { target });
    } catch (error) {
      showToast(error.message);
    } finally {
      guidedOpenProfileButton.disabled = false;
    }
  }

  if (guidedScrollButton) {
    try {
      const profile = multiloginProfileById(guidedScrollButton.dataset.profileId) || selectedGuidedProfile();
      guidedScrollButton.disabled = true;
      await runManualCommandControl(profile, guidedScrollButton.dataset.command || "scroll_prompt");
    } catch (error) {
      showToast(error.message);
    } finally {
      guidedScrollButton.disabled = false;
    }
  }

  if (guidedScrollCheckButton) {
    try {
      const profile = multiloginProfileById(guidedScrollCheckButton.dataset.profileId) || selectedGuidedProfile();
      guidedScrollCheckButton.disabled = true;
      await scrollAndCheckPost(profile, { count: 1 });
    } catch (error) {
      showToast(error.message);
    } finally {
      guidedScrollCheckButton.disabled = false;
    }
  }

  if (guidedPostActionButton) {
    try {
      const profile = multiloginProfileById(guidedPostActionButton.dataset.profileId) || selectedGuidedProfile();
      const command = guidedPostActionButton.dataset.command;
      const options =
        command === "comment_visible"
          ? { text: document.querySelector("#guidedCommentText")?.value || "" }
          : {};
      guidedPostActionButton.disabled = true;
      await runManualCommandControl(profile, command, options);
    } catch (error) {
      showToast(error.message);
    } finally {
      guidedPostActionButton.disabled = false;
    }
  }

  if (aiDraftButton) {
    try {
      const profile = multiloginProfileById(aiDraftButton.dataset.profileId) || selectedGuidedProfile();
      aiDraftButton.disabled = true;
      await generateAiDraftForProfile(profile, aiDraftButton.dataset.mode || "reply");
    } catch (error) {
      showToast(error.message);
    } finally {
      aiDraftButton.disabled = false;
    }
  }

  if (guidedScreenshotButton) {
    try {
      const profile = multiloginProfileById(guidedScreenshotButton.dataset.profileId) || selectedGuidedProfile();
      guidedScreenshotButton.disabled = true;
      await runManualCommandControl(profile, "screenshot");
    } catch (error) {
      showToast(error.message);
    } finally {
      guidedScreenshotButton.disabled = false;
    }
  }

  if (guidedBackButton || guidedHomeButton) {
    const button = guidedBackButton || guidedHomeButton;
    try {
      const profile = multiloginProfileById(button.dataset.profileId) || selectedGuidedProfile();
      button.disabled = true;
      await runManualCommandControl(profile, button.dataset.command);
    } catch (error) {
      showToast(error.message);
    } finally {
      button.disabled = false;
    }
  }

  if (guidedStopButton) {
    try {
      const profile = multiloginProfileById(guidedStopButton.dataset.profileId) || selectedGuidedProfile();
      await stopProfileControl(profile);
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

  if (phoneControlProfileSetupButton) {
    try {
      const profile = profileFromButton(phoneControlProfileSetupButton);
      selectProfileForPhoneControl(profile);
      showToast("Profile selected. Open the phone, enable ADB, then Connect + verify.");
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
        functionId: canRunAndroidCommandsForProfile(queueReviewButton.dataset.profileId) ? "open_x_app" : "open_post_prompt",
        profileId: queueReviewButton.dataset.profileId,
        targetUrl: "",
        notes: canRunAndroidCommandsForProfile(queueReviewButton.dataset.profileId) ? "Open X app for review" : "Review manually in the visible phone viewer"
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
        functionId: canRunAndroidCommandsForProfile(priorityQueueButton.dataset.profileId) ? "open_x_app" : "open_post_prompt",
        profileId: priorityQueueButton.dataset.profileId,
        targetUrl: nodes.sessionTargetUrl.value,
        notes: canRunAndroidCommandsForProfile(priorityQueueButton.dataset.profileId) ? "Open X app from priority board" : "Review manually in the visible phone viewer"
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

  if (phoneControlViewerButton) {
    const profile = selectedPhoneControlProfile();
    try {
      await openViewerControl(profile, { message: "Selected phone opened." });
      startPhoneAutoConnect(profile, { openXOnReady: true });
    } catch (error) {
      showToast(error.message);
    }
  }

  if (phoneAutoConnectButton) {
    try {
      startPhoneAutoConnect(selectedPhoneControlProfile(), { openXOnReady: true });
    } catch (error) {
      showToast(error.message);
    }
  }

  if (adbPasteButton) {
    try {
      if (!navigator.clipboard?.readText) throw new Error("Clipboard paste is not available in this browser.");
      adbSetupText = await navigator.clipboard.readText();
      const textArea = document.querySelector("#adbSetupText");
      if (textArea) textArea.value = adbSetupText;
      renderPhoneControlPanel();
      showToast(adbSetupText ? "ADB commands pasted." : "Clipboard is empty.");
    } catch (error) {
      showToast(error.message);
    }
  }

  if (phoneControlTestButton) {
    const profile = selectedPhoneControlProfile();
    try {
      phoneControlTestButton.disabled = true;
      await runManualCommandControl(profile, "screenshot");
    } catch (error) {
      showToast(error.message);
    } finally {
      phoneControlTestButton.disabled = false;
    }
  }

  if (phoneControlOpenXButton) {
    const profile = selectedPhoneControlProfile();
    try {
      phoneControlOpenXButton.disabled = true;
      await openXControl(profile);
    } catch (error) {
      showToast(error.message);
    } finally {
      phoneControlOpenXButton.disabled = false;
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
      text: command === "type_text" || command === "comment_visible" ? draft : "",
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

  if (adbRefreshButton) {
    try {
      phoneControlState = await api("/api/multilogin/control-status");
      const profile = selectedPhoneControlProfile();
      render();
      showToast(profile && canRunAndroidCommandsForProfile(profile.id) ? "Phone control ready." : androidControlReasonForProfile(profile?.id));
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

document.addEventListener("change", (event) => {
  const assistiveAdbSelect = event.target.closest(".assistive-adb-select");
  const guidedProfileSelect = event.target.closest(".guided-profile-select");

  if (guidedProfileSelect) {
    const profile = multiloginProfileById(guidedProfileSelect.value);
    if (profile?.id) {
      if (nodes.sessionProfileSelect) nodes.sessionProfileSelect.value = profile.id;
      if (nodes.operatorProfileSelect) nodes.operatorProfileSelect.value = profile.id;
      render();
      showToast("Phone selected.");
    }
    return;
  }

  if (!assistiveAdbSelect) return;

  const profile = assistiveProfile();
  if (profile?.id) {
    setAdbMapping(profile.id, assistiveAdbSelect.value);
    render();
    showToast(assistiveAdbSelect.value ? "ADB device mapped to this profile." : "ADB mapping cleared.");
  }
});

document.addEventListener("input", (event) => {
  if (event.target?.id === "adbSetupText") adbSetupText = event.target.value;
  if (event.target?.id === "guidedAdbSetupText") adbSetupText = event.target.value;
  if (event.target?.id === "guidedCommentText") localStorage.setItem("telephones.commentDraft", event.target.value);
});

document.addEventListener("submit", async (event) => {
  if (!["adbConnectForm", "guidedAdbConnectForm"].includes(event.target?.id)) return;
  event.preventDefault();

  const guided = event.target.id === "guidedAdbConnectForm";
  const textArea = event.target.querySelector(guided ? "#guidedAdbSetupText" : "#adbSetupText");
  adbSetupText = textArea?.value || "";

  try {
    const profile = guided ? selectedGuidedProfile() : selectedPhoneControlProfile();
    await connectAdbSetupText(adbSetupText, { profile, openXAfterConnect: guided });
  } catch (error) {
    showToast(error.message);
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
