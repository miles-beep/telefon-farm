import { randomUUID } from "node:crypto";

const ACTIONS = [
  "view",
  "watch",
  "like",
  "follow",
  "comment",
  "post",
  "save",
  "repost",
  "scroll",
  "dwell",
  "open_post",
  "share_intent",
  "follow_link"
];
const SPEED_BATCH_SIZE = {
  low: 2,
  medium: 5,
  high: 12
};

const COMMENT_BANK = [
  "Interesting test result.",
  "This looks useful for the demo.",
  "Saving this for the report.",
  "The timing pattern is easy to compare.",
  "Good sandbox example.",
  "This mock post has useful signals."
];

const DISPLAY_NAMES = [
  "Mira",
  "Niko",
  "Elena",
  "Viktor",
  "Iva",
  "Alex",
  "Raya",
  "Toni",
  "Deni",
  "Sofia",
  "Boris",
  "Maya"
];

const AGENT_NAMES = [
  "North Watch",
  "Signal Desk",
  "Pulse Runner",
  "Queue Scout",
  "Trust Lens",
  "Cadence Bot",
  "Review Pilot",
  "Traffic Meter"
];

const BEHAVIOR_TEMPLATES = [
  {
    id: "scroll",
    label: "Scroll",
    action: "scroll",
    minSec: 1,
    maxSec: 6,
    weight: 0.45,
    enabled: true
  },
  {
    id: "dwell",
    label: "Dwell",
    action: "dwell",
    minSec: 3,
    maxSec: 45,
    weight: 0.3,
    enabled: true
  },
  {
    id: "open_post",
    label: "Open post",
    action: "open_post",
    minSec: 5,
    maxSec: 60,
    weight: 0.12,
    enabled: true
  },
  {
    id: "save_post",
    label: "Save post",
    action: "save",
    minSec: 1,
    maxSec: 4,
    weight: 0.1,
    enabled: true
  },
  {
    id: "like",
    label: "Like",
    action: "like",
    minSec: 1,
    maxSec: 3,
    weight: 0.05,
    enabled: true
  },
  {
    id: "comment_draft",
    label: "Comment draft",
    action: "comment",
    minSec: 10,
    maxSec: 90,
    weight: 0.03,
    enabled: true
  },
  {
    id: "repost_draft",
    label: "Repost draft",
    action: "repost",
    minSec: 3,
    maxSec: 20,
    weight: 0.04,
    enabled: true
  },
  {
    id: "share_intent",
    label: "Share intent",
    action: "share_intent",
    minSec: 2,
    maxSec: 10,
    weight: 0.02,
    enabled: true
  },
  {
    id: "follow_link",
    label: "Follow link",
    action: "follow_link",
    minSec: 10,
    maxSec: 120,
    weight: 0.03,
    enabled: true
  }
];

export const detectionRules = [
  {
    id: "action-rate",
    label: "High action rate",
    description: "Many events in a short time window increase risk."
  },
  {
    id: "duplicate-text",
    label: "Repeated comment text",
    description: "Repeated text across comments is treated as automation-like behavior."
  },
  {
    id: "cold-start",
    label: "Cold-start engagement",
    description: "New accounts that immediately perform many actions receive a higher score."
  },
  {
    id: "timing-pattern",
    label: "Regular timing pattern",
    description: "Events with nearly identical spacing look scripted."
  },
  {
    id: "device-crowding",
    label: "Device crowding",
    description: "Too many accounts sharing the same mock device profile increases risk."
  }
];

const state = {
  platforms: [
    {
      id: "micropost",
      name: "MicroPost",
      shortName: "MP",
      category: "short text",
      color: "#2f6f73"
    },
    {
      id: "cliptok",
      name: "ClipTok",
      shortName: "CT",
      category: "short video",
      color: "#b54634"
    },
    {
      id: "vidtube",
      name: "VidTube",
      shortName: "VT",
      category: "video",
      color: "#315f9f"
    },
    {
      id: "threadhub",
      name: "ThreadHub",
      shortName: "TH",
      category: "forum",
      color: "#8c6b2f"
    }
  ],
  deviceProfiles: [
    {
      id: "device_sofia_android",
      label: "Sofia Android Lab",
      os: "Android 15",
      region: "BG-Sofia",
      network: "Campus Wi-Fi",
      riskHint: "shared lab profile"
    },
    {
      id: "device_plovdiv_ios",
      label: "Plovdiv iOS Lab",
      os: "iOS 19",
      region: "BG-Plovdiv",
      network: "Fiber test line",
      riskHint: "normal"
    },
    {
      id: "device_varna_android",
      label: "Varna Android Lab",
      os: "Android 14",
      region: "BG-Varna",
      network: "Mobile test label",
      riskHint: "normal"
    },
    {
      id: "device_burgas_tablet",
      label: "Burgas Tablet Lab",
      os: "Tablet OS",
      region: "BG-Burgas",
      network: "School network",
      riskHint: "shared lab profile"
    }
  ],
  accounts: [],
  agents: [],
  posts: [],
  campaigns: [],
  events: [],
  otpQueue: []
};

let seeded = false;

function id(prefix) {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

function iso(date = new Date()) {
  return date.toISOString();
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function roundWeight(value, fallback) {
  return Math.round(clampNumber(value, 0, 1, fallback) * 100) / 100;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function makeBehaviorRecipe() {
  return BEHAVIOR_TEMPLATES.map((behavior) => ({ ...behavior }));
}

function randomSeconds(minSec, maxSec) {
  const min = clampNumber(minSec, 0, 3600, 0);
  const max = clampNumber(maxSec, min, 3600, min);
  return Math.round(min + Math.random() * (max - min));
}

function pickWeighted(list) {
  const total = list.reduce((sum, item) => sum + Math.max(0, Number(item.weight) || 0), 0);
  if (total <= 0) return pick(list);

  let cursor = Math.random() * total;
  for (const item of list) {
    cursor -= Math.max(0, Number(item.weight) || 0);
    if (cursor <= 0) return item;
  }
  return list.at(-1);
}

function minutesAgo(minutes) {
  return iso(new Date(Date.now() - minutes * 60 * 1000));
}

function getPlatform(platformId) {
  return state.platforms.find((platform) => platform.id === platformId);
}

function getAccount(accountId) {
  return state.accounts.find((account) => account.id === accountId);
}

function getAgent(agentId) {
  return state.agents.find((agent) => agent.id === agentId);
}

function createOtp(accountId) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const otp = {
    id: id("otp"),
    accountId,
    code,
    createdAt: iso(),
    expiresAt: iso(new Date(Date.now() + 15 * 60 * 1000)),
    usedAt: null
  };
  state.otpQueue.unshift(otp);
  state.otpQueue = state.otpQueue.slice(0, 50);
  return otp;
}

function makeAccountName(platformId, index) {
  const base = pick(DISPLAY_NAMES);
  return `${base}_${platformId}_${String(index).padStart(2, "0")}`;
}

function createAccount({
  platformId,
  deviceProfileId,
  status = "pending",
  sessionStatus,
  createdAt = iso(),
  label
}) {
  const platform = getPlatform(platformId) ?? state.platforms[0];
  const device = state.deviceProfiles.find((item) => item.id === deviceProfileId) ?? pick(state.deviceProfiles);
  const account = {
    id: id("acct"),
    handle: label ?? makeAccountName(platform.id, state.accounts.length + 1),
    platformId: platform.id,
    deviceProfileId: device.id,
    status,
    sessionStatus: sessionStatus ?? (status === "verified" ? "logged_out" : "locked"),
    createdAt,
    verifiedAt: status === "verified" ? createdAt : null,
    lastLoginAt: sessionStatus === "logged_in" ? createdAt : null,
    lastSeenAt: createdAt,
    behaviorRecipe: makeBehaviorRecipe(),
    trustScore: status === "verified" ? 62 : 20
  };
  state.accounts.push(account);

  let otp = null;
  if (status !== "verified") {
    otp = createOtp(account.id);
  }

  return { account, otp };
}

export function createAgent({
  name,
  platformId,
  deviceProfileId,
  status = "running",
  assignedAccountIds = [],
  createdAt = iso()
}) {
  const platform = getPlatform(platformId);
  if (!platform) {
    throw new Error("Select a valid mock platform.");
  }

  const device = state.deviceProfiles.find((item) => item.id === deviceProfileId) ?? pick(state.deviceProfiles);
  const verifiedAccountIds = state.accounts
    .filter((account) => account.platformId === platform.id && account.status === "verified")
    .map((account) => account.id);
  const safeAssignedAccountIds = assignedAccountIds.length
    ? assignedAccountIds.filter((accountId) => verifiedAccountIds.includes(accountId))
    : verifiedAccountIds.slice(0, 8);

  const agent = {
    id: id("agent"),
    name: String(name || `${pick(AGENT_NAMES)} ${platform.shortName}`).slice(0, 60),
    platformId: platform.id,
    deviceProfileId: device.id,
    assignedAccountIds: safeAssignedAccountIds,
    status: ["running", "idle", "paused"].includes(status) ? status : "running",
    createdAt,
    lastHeartbeatAt: createdAt,
    note: "Local sandbox monitor"
  };
  state.agents.push(agent);
  return agent;
}

function recordEvent({
  accountId,
  platformId,
  action,
  campaignId = null,
  agentId = null,
  postId = null,
  createdAt = iso(),
  metadata = {}
}) {
  const account = getAccount(accountId);
  if (!account) {
    throw new Error(`Unknown account: ${accountId}`);
  }

  const event = {
    id: id("evt"),
    accountId,
    platformId: platformId ?? account.platformId,
    action,
    campaignId,
    agentId,
    postId,
    createdAt,
    metadata
  };
  state.events.push(event);
  state.events = state.events.slice(-1500);
  account.lastSeenAt = createdAt;

  const agent = agentId ? getAgent(agentId) : null;
  if (agent) {
    agent.lastHeartbeatAt = createdAt;
    if (agent.status === "idle") agent.status = "running";
  }

  return event;
}

function createPost(platformId, authorAccountId, text, createdAt = iso()) {
  const post = {
    id: id("post"),
    platformId,
    authorAccountId,
    text,
    createdAt,
    repostOfPostId: null
  };
  state.posts.push(post);
  return post;
}

function createRepost(platformId, authorAccountId, sourcePost, note, createdAt = iso()) {
  const text = String(note || `Repost: ${sourcePost.text}`).slice(0, 180);
  const post = {
    id: id("post"),
    platformId,
    authorAccountId,
    text,
    createdAt,
    repostOfPostId: sourcePost.id
  };
  state.posts.push(post);
  return post;
}

function seededActionForIndex(index) {
  return ["view", "watch", "like", "view", "follow", "comment"][index % 6];
}

function pickAgentForPlatform(platformId) {
  const runningAgents = state.agents.filter((agent) => agent.platformId === platformId && agent.status === "running");
  if (runningAgents.length) return pick(runningAgents);

  const idleAgents = state.agents.filter((agent) => agent.platformId === platformId && agent.status === "idle");
  return idleAgents.length ? pick(idleAgents) : null;
}

export function seedDemoData() {
  if (seeded) return;
  seeded = true;

  for (const platform of state.platforms) {
    for (let index = 0; index < 5; index += 1) {
      createAccount({
        platformId: platform.id,
        deviceProfileId: state.deviceProfiles[index % state.deviceProfiles.length].id,
        status: index < 4 ? "verified" : "pending",
        sessionStatus: index < 2 ? "logged_in" : index < 4 ? "logged_out" : "locked",
        createdAt: minutesAgo(240 - index * 18)
      });
    }
  }

  const verifiedAccounts = state.accounts.filter((account) => account.status === "verified");
  for (const platform of state.platforms) {
    const authors = verifiedAccounts.filter((account) => account.platformId === platform.id);
    for (let index = 0; index < authors.length; index += 1) {
      createPost(
        platform.id,
        authors[index].id,
        `${platform.name} sample post ${index + 1}: ${pick(COMMENT_BANK)}`,
        minutesAgo(140 - index * 16)
      );
    }
  }

  for (const platform of state.platforms) {
    const platformAccounts = verifiedAccounts.filter((account) => account.platformId === platform.id);
    for (let index = 0; index < 2; index += 1) {
      createAgent({
        name: `${AGENT_NAMES[state.agents.length % AGENT_NAMES.length]} ${platform.shortName}`,
        platformId: platform.id,
        deviceProfileId: state.deviceProfiles[(state.agents.length + index) % state.deviceProfiles.length].id,
        status: index === 0 ? "running" : "idle",
        assignedAccountIds: platformAccounts
          .filter((_, accountIndex) => accountIndex % 2 === index)
          .map((account) => account.id),
        createdAt: minutesAgo(210 - state.agents.length * 8)
      });
    }
  }

  const sampleCampaign = createCampaign({
    name: "Morning baseline",
    platformId: "cliptok",
    speed: "low",
    durationMinutes: 45,
    actions: ["view", "watch", "like"]
  });
  sampleCampaign.status = "completed";
  sampleCampaign.startedAt = minutesAgo(90);
  sampleCampaign.stoppedAt = minutesAgo(45);

  for (let index = 0; index < 90; index += 1) {
    const account = pick(verifiedAccounts);
    const action = seededActionForIndex(index);
    const post = pick(state.posts.filter((item) => item.platformId === account.platformId));
    const agent = pickAgentForPlatform(account.platformId);
    recordEvent({
      accountId: account.id,
      platformId: account.platformId,
      action,
      campaignId: index < 25 && account.platformId === "cliptok" ? sampleCampaign.id : null,
      agentId: agent?.id ?? null,
      postId: post?.id ?? null,
      createdAt: minutesAgo(180 - index * 1.7),
      metadata: action === "comment" ? { text: pick(COMMENT_BANK) } : makeEventMetadata(action)
    });
  }
}

export function createAccounts({ platformId, count = 1, deviceProfileId }) {
  const platform = getPlatform(platformId);
  if (!platform) {
    throw new Error("Select a valid mock platform.");
  }

  const safeCount = clampNumber(count, 1, 50, 1);
  const created = [];
  for (let index = 0; index < safeCount; index += 1) {
    created.push(createAccount({ platformId: platform.id, deviceProfileId }));
  }
  return created;
}

export function verifyAccount(accountId, code) {
  const account = getAccount(accountId);
  if (!account) throw new Error("Account not found.");
  if (account.status === "verified") return account;

  const otp = state.otpQueue.find((item) => item.accountId === accountId && !item.usedAt);
  if (!otp) throw new Error("No active OTP exists for this account.");
  if (String(code).trim() !== otp.code) throw new Error("Incorrect mock OTP code.");

  otp.usedAt = iso();
  account.status = "verified";
  account.sessionStatus = "logged_out";
  account.verifiedAt = iso();
  account.trustScore = 55;
  return account;
}

export function loginProfile(accountId) {
  const account = getAccount(accountId);
  if (!account) throw new Error("Profile not found.");
  if (account.status !== "verified") throw new Error("Verify this mock profile before login.");

  account.sessionStatus = "logged_in";
  account.lastLoginAt = iso();
  account.lastSeenAt = account.lastLoginAt;
  recordEvent({
    accountId: account.id,
    platformId: account.platformId,
    action: "login",
    metadata: {
      mode: "local mock session"
    }
  });
  return account;
}

export function logoutProfile(accountId) {
  const account = getAccount(accountId);
  if (!account) throw new Error("Profile not found.");
  if (account.status !== "verified") throw new Error("Only verified mock profiles can log out.");

  recordEvent({
    accountId: account.id,
    platformId: account.platformId,
    action: "logout",
    metadata: {
      mode: "local mock session"
    }
  });
  account.sessionStatus = "logged_out";
  account.lastSeenAt = iso();
  return account;
}

export function updateProfileBehavior(accountId, behaviorId, patch = {}) {
  const account = getAccount(accountId);
  if (!account) throw new Error("Profile not found.");

  account.behaviorRecipe = account.behaviorRecipe?.length ? account.behaviorRecipe : makeBehaviorRecipe();
  const behavior = account.behaviorRecipe.find((item) => item.id === behaviorId);
  if (!behavior) throw new Error("Behavior not found.");

  if (Object.hasOwn(patch, "enabled")) {
    behavior.enabled = Boolean(patch.enabled);
  }
  if (Object.hasOwn(patch, "minSec")) {
    behavior.minSec = clampNumber(patch.minSec, 0, 3600, behavior.minSec);
  }
  if (Object.hasOwn(patch, "maxSec")) {
    behavior.maxSec = clampNumber(patch.maxSec, behavior.minSec, 3600, behavior.maxSec);
  }
  if (Object.hasOwn(patch, "weight")) {
    behavior.weight = roundWeight(patch.weight, behavior.weight);
  }

  if (behavior.maxSec < behavior.minSec) {
    behavior.maxSec = behavior.minSec;
  }

  account.lastSeenAt = iso();
  return account;
}

function getPost(postId) {
  return state.posts.find((post) => post.id === postId);
}

function assertProfileCanInteract(account, post) {
  if (account.status !== "verified") {
    throw new Error("Verify this mock profile before running activity.");
  }
  if (account.sessionStatus !== "logged_in") {
    throw new Error("Log in this mock profile before running activity.");
  }
  if (post.authorAccountId === account.id) {
    throw new Error("Choose a post from another profile.");
  }
}

export function interactWithPost({
  accountId,
  postId,
  action = "save",
  text,
  campaignId = null,
  agentId = null,
  behavior = null
}) {
  const account = getAccount(accountId);
  if (!account) throw new Error("Profile not found.");

  const post = getPost(postId);
  if (!post) throw new Error("Post not found.");
  if (post.platformId !== account.platformId) throw new Error("Profile and post must use the same mock platform.");

  const safeAction = ACTIONS.includes(action) ? action : "save";
  assertProfileCanInteract(account, post);

  let targetPostId = post.id;
  const metadata = {
    sourcePostId: post.id,
    sourceAuthorAccountId: post.authorAccountId,
    sourceText: post.text
  };

  if (behavior) {
    metadata.behavior = {
      id: behavior.id,
      label: behavior.label,
      rangeSec: [behavior.minSec, behavior.maxSec],
      weight: behavior.weight,
      elapsedSec: randomSeconds(behavior.minSec, behavior.maxSec)
    };
  }

  if (safeAction === "comment") {
    metadata.text = String(text || pick(COMMENT_BANK)).slice(0, 180);
  }

  if (safeAction === "repost") {
    const repost = createRepost(account.platformId, account.id, post, text, iso());
    targetPostId = repost.id;
    metadata.repostOfPostId = post.id;
    metadata.text = repost.text;
  }

  if (safeAction === "save") {
    metadata.saved = true;
  }

  return recordEvent({
    accountId: account.id,
    platformId: account.platformId,
    action: safeAction,
    campaignId,
    agentId,
    postId: targetPostId,
    metadata
  });
}

export function runProfileTask({
  platformId,
  accountIds = [],
  actions = ["save", "comment"],
  count = 12,
  commentText
}) {
  const platform = getPlatform(platformId);
  if (!platform) throw new Error("Select a valid mock platform.");

  const safeActions = actions.filter((action) =>
    ["save", "repost", "comment", "like", "follow", "view", "scroll", "dwell", "open_post", "share_intent", "follow_link"].includes(action)
  );
  const loggedInProfileIds = state.accounts
    .filter((account) => account.platformId === platform.id && account.status === "verified" && account.sessionStatus === "logged_in")
    .map((account) => account.id);
  const usableProfileIds = accountIds.length
    ? accountIds.filter((accountId) => loggedInProfileIds.includes(accountId))
    : loggedInProfileIds;

  if (!usableProfileIds.length) {
    throw new Error("Log in at least one verified profile for this mock platform.");
  }

  const safeCount = clampNumber(count, 1, 100, 12);
  const generated = [];

  for (let index = 0; index < safeCount; index += 1) {
    const account = getAccount(pick(usableProfileIds));
    const targetPosts = state.posts.filter(
      (post) => post.platformId === platform.id && post.authorAccountId !== account.id
    );
    if (!targetPosts.length) break;

    const agent = pickAgentForPlatform(platform.id);
    const enabledBehaviors = (account.behaviorRecipe?.length ? account.behaviorRecipe : makeBehaviorRecipe()).filter(
      (behavior) => behavior.enabled
    );
    const matchingBehaviors = enabledBehaviors.filter((behavior) =>
      safeActions.length ? safeActions.includes(behavior.action) : true
    );
    const behavior = matchingBehaviors.length ? pickWeighted(matchingBehaviors) : pickWeighted(enabledBehaviors);
    const action = behavior?.action ?? pick(safeActions.length ? safeActions : ["save"]);
    generated.push(
      interactWithPost({
        accountId: account.id,
        postId: pick(targetPosts).id,
        action,
        text: action === "comment" || action === "repost" ? commentText : undefined,
        agentId: agent?.id ?? null,
        behavior
      })
    );
  }

  return generated;
}

export function pauseAgent(agentId) {
  const agent = getAgent(agentId);
  if (!agent) throw new Error("Agent not found.");
  agent.status = "paused";
  agent.lastHeartbeatAt = iso();
  return agent;
}

export function resumeAgent(agentId) {
  const agent = getAgent(agentId);
  if (!agent) throw new Error("Agent not found.");
  agent.status = "running";
  agent.lastHeartbeatAt = iso();
  return agent;
}

export function createCampaign({
  name,
  platformId,
  accountIds = [],
  actions = ["view", "like"],
  durationMinutes = 30,
  speed = "medium"
}) {
  const platform = getPlatform(platformId);
  if (!platform) {
    throw new Error("Select a valid mock platform.");
  }

  const selectedActions = actions.filter((action) => ACTIONS.includes(action));
  const verifiedAccountIds = state.accounts
    .filter((account) => account.platformId === platform.id && account.status === "verified")
    .map((account) => account.id);
  const usableAccountIds = accountIds.length
    ? accountIds.filter((accountId) => verifiedAccountIds.includes(accountId))
    : verifiedAccountIds;

  if (usableAccountIds.length === 0) {
    throw new Error("Create and verify at least one account for this mock platform.");
  }

  const campaign = {
    id: id("camp"),
    name: String(name || `${platform.name} campaign`).slice(0, 80),
    platformId: platform.id,
    accountIds: usableAccountIds.slice(0, 100),
    actions: selectedActions.length ? selectedActions : ["view"],
    durationMinutes: clampNumber(durationMinutes, 1, 240, 30),
    speed: SPEED_BATCH_SIZE[speed] ? speed : "medium",
    status: "draft",
    createdAt: iso(),
    startedAt: null,
    stoppedAt: null,
    eventCount: 0
  };
  state.campaigns.unshift(campaign);
  return campaign;
}

export function startCampaign(campaignId) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) throw new Error("Campaign not found.");
  campaign.status = "running";
  campaign.startedAt = campaign.startedAt ?? iso();
  campaign.stoppedAt = null;
  return campaign;
}

export function stopCampaign(campaignId) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) throw new Error("Campaign not found.");
  campaign.status = "stopped";
  campaign.stoppedAt = iso();
  return campaign;
}

function makeEventMetadata(action, campaignSpeed = "medium") {
  if (action === "watch") {
    return { seconds: Math.floor(7 + Math.random() * 54) };
  }
  if (action === "comment") {
    const repeatedText = campaignSpeed === "high" && Math.random() > 0.35;
    return {
      text: repeatedText ? COMMENT_BANK[0] : pick(COMMENT_BANK)
    };
  }
  if (action === "post") {
    return { text: `Sandbox post ${Math.floor(Math.random() * 999)}` };
  }
  return {};
}

export function generateEventsForCampaign(campaignId, explicitCount) {
  const campaign = state.campaigns.find((item) => item.id === campaignId);
  if (!campaign) throw new Error("Campaign not found.");
  if (campaign.status !== "running") return [];

  const batchSize = explicitCount ?? SPEED_BATCH_SIZE[campaign.speed] ?? SPEED_BATCH_SIZE.medium;
  const platformPosts = state.posts.filter((post) => post.platformId === campaign.platformId);
  const events = [];

  for (let index = 0; index < batchSize; index += 1) {
    const accountId = pick(campaign.accountIds);
    const action = pick(campaign.actions);
    const agent = pickAgentForPlatform(campaign.platformId);
    const metadata = makeEventMetadata(action, campaign.speed);
    const post =
      action === "post"
        ? createPost(campaign.platformId, accountId, metadata.text, iso())
        : platformPosts.length
          ? pick(platformPosts)
          : null;
    const event = recordEvent({
      accountId,
      platformId: campaign.platformId,
      action,
      campaignId: campaign.id,
      agentId: agent?.id ?? null,
      postId: post?.id ?? null,
      metadata
    });
    events.push(event);
  }

  campaign.eventCount += events.length;
  return events;
}

export function tickRunningCampaigns() {
  const generated = [];
  const nowMs = Date.now();

  for (const campaign of state.campaigns) {
    if (campaign.status !== "running") continue;

    const startedAt = new Date(campaign.startedAt).getTime();
    const elapsedMinutes = (nowMs - startedAt) / 60000;
    if (elapsedMinutes >= campaign.durationMinutes) {
      campaign.status = "completed";
      campaign.stoppedAt = iso();
      continue;
    }

    generated.push(...generateEventsForCampaign(campaign.id));
  }

  for (const agent of state.agents) {
    if (agent.status === "running") {
      agent.lastHeartbeatAt = iso();
    }
  }

  return generated;
}

export function generateBaselineEvents(count = 25) {
  const verifiedAccounts = state.accounts.filter((account) => account.status === "verified");
  const safeCount = clampNumber(count, 1, 200, 25);
  const generated = [];

  for (let index = 0; index < safeCount && verifiedAccounts.length; index += 1) {
    const account = pick(verifiedAccounts);
    const action = pick(["view", "view", "watch", "like", "follow", "comment"]);
    const post = pick(state.posts.filter((item) => item.platformId === account.platformId));
    const agent = pickAgentForPlatform(account.platformId);
    generated.push(
      recordEvent({
        accountId: account.id,
        platformId: account.platformId,
        action,
        agentId: agent?.id ?? null,
        postId: post?.id ?? null,
        metadata: makeEventMetadata(action)
      })
    );
  }

  return generated;
}

function getAgentEvents(agentId, minutes = 60) {
  const since = Date.now() - minutes * 60 * 1000;
  return state.events.filter((event) => event.agentId === agentId && new Date(event.createdAt).getTime() >= since);
}

function getProfileEvents(accountId, minutes = 60) {
  const since = Date.now() - minutes * 60 * 1000;
  return state.events.filter((event) => event.accountId === accountId && new Date(event.createdAt).getTime() >= since);
}

function summarizeProfile(account) {
  const allEvents = state.events.filter((event) => event.accountId === account.id);
  const recentEvents = getProfileEvents(account.id, 60);
  const savedEvents = allEvents.filter((event) => event.action === "save");
  const commentEvents = allEvents.filter((event) => event.action === "comment");
  const repostEvents = allEvents.filter((event) => event.action === "repost");
  const likedEvents = allEvents.filter((event) => event.action === "like");

  return {
    eventsLastHour: recentEvents.length,
    totalEvents: allEvents.length,
    savedPosts: savedEvents.length,
    comments: commentEvents.length,
    reposts: repostEvents.length,
    likes: likedEvents.length,
    lastActivityAt: allEvents.length
      ? [...allEvents].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0].createdAt
      : null
  };
}

function summarizeAgent(agent) {
  const assignedAccounts = state.accounts.filter((account) => agent.assignedAccountIds.includes(account.id));
  const scoredAccounts = assignedAccounts.map(scoreAccount);
  const averageDetectionScore = scoredAccounts.length
    ? Math.round(scoredAccounts.reduce((sum, item) => sum + item.score, 0) / scoredAccounts.length)
    : 0;
  const flaggedAccounts = scoredAccounts.filter((item) => item.score >= 70).length;
  const recentEvents = getAgentEvents(agent.id, 60);
  const allEvents = state.events.filter((event) => event.agentId === agent.id);
  const runningCampaigns = state.campaigns.filter(
    (campaign) => campaign.platformId === agent.platformId && campaign.status === "running"
  );
  const heartbeatAgeSeconds = Math.max(0, Math.round((Date.now() - new Date(agent.lastHeartbeatAt).getTime()) / 1000));
  const queueDepth = runningCampaigns.reduce(
    (sum, campaign) => sum + (SPEED_BATCH_SIZE[campaign.speed] ?? SPEED_BATCH_SIZE.medium),
    0
  );
  const health =
    agent.status === "paused"
      ? "paused"
      : heartbeatAgeSeconds > 120
        ? "stale"
        : averageDetectionScore >= 70 || flaggedAccounts > 0
          ? "review"
          : recentEvents.length > 0 || runningCampaigns.length > 0
            ? "active"
            : "idle";

  return {
    assignedAccounts: assignedAccounts.length,
    averageDetectionScore,
    flaggedAccounts,
    eventsLastHour: recentEvents.length,
    totalEvents: allEvents.length,
    queueDepth,
    runningCampaigns: runningCampaigns.length,
    heartbeatAgeSeconds,
    health,
    lastEventAt: allEvents.length
      ? [...allEvents].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0].createdAt
      : null
  };
}

function getAccountEvents(accountId, minutes = 60) {
  const since = Date.now() - minutes * 60 * 1000;
  return state.events.filter((event) => event.accountId === accountId && new Date(event.createdAt).getTime() >= since);
}

function hasRegularTiming(events) {
  if (events.length < 6) return false;
  const sorted = [...events].sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
  const deltas = [];
  for (let index = 1; index < sorted.length; index += 1) {
    deltas.push(new Date(sorted[index].createdAt).getTime() - new Date(sorted[index - 1].createdAt).getTime());
  }
  const average = deltas.reduce((sum, item) => sum + item, 0) / deltas.length;
  const variance = deltas.reduce((sum, item) => sum + Math.abs(item - average), 0) / deltas.length;
  return average > 0 && variance / average < 0.18;
}

export function scoreAccount(account) {
  const recent = getAccountEvents(account.id, 30);
  const allEvents = state.events.filter((event) => event.accountId === account.id);
  const comments = recent.filter((event) => event.action === "comment" && event.metadata.text);
  const uniqueComments = new Set(comments.map((event) => event.metadata.text));
  const deviceAccountCount = state.accounts.filter(
    (item) => item.deviceProfileId === account.deviceProfileId && item.status === "verified"
  ).length;
  const accountAgeMinutes = (Date.now() - new Date(account.createdAt).getTime()) / 60000;

  let score = 0;
  const reasons = [];

  if (recent.length >= 12) {
    const points = Math.min(35, recent.length * 2);
    score += points;
    reasons.push(`High recent action rate (${recent.length} events / 30m)`);
  }

  if (comments.length >= 3 && uniqueComments.size <= Math.ceil(comments.length / 2)) {
    score += 20;
    reasons.push("Repeated comment text");
  }

  if (accountAgeMinutes < 120 && allEvents.length >= 15) {
    score += 18;
    reasons.push("New account with heavy activity");
  }

  if (hasRegularTiming(recent)) {
    score += 17;
    reasons.push("Regular timing pattern");
  }

  if (deviceAccountCount >= 5) {
    score += 12;
    reasons.push("Many verified accounts share one mock device");
  }

  if (account.status !== "verified") {
    score += 8;
    reasons.push("Unverified account");
  }

  const finalScore = Math.min(100, Math.round(score));
  return {
    accountId: account.id,
    score: finalScore,
    level: finalScore >= 70 ? "high" : finalScore >= 35 ? "medium" : "low",
    reasons: reasons.length ? reasons : ["Normal sandbox behavior"]
  };
}

export function getAnalytics() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const eventsLastHour = state.events.filter((event) => new Date(event.createdAt).getTime() >= oneHourAgo);
  const scoredAccounts = state.accounts.map(scoreAccount);
  const flaggedAccounts = scoredAccounts.filter((item) => item.score >= 70);
  const savedEvents = state.events.filter((event) => event.action === "save");
  const commentEvents = state.events.filter((event) => event.action === "comment");
  const repostEvents = state.events.filter((event) => event.action === "repost");
  const agentSummaries = state.agents.map(summarizeAgent);
  const platformActivity = state.platforms.map((platform) => {
    const total = state.events.filter((event) => event.platformId === platform.id).length;
    const recent = eventsLastHour.filter((event) => event.platformId === platform.id).length;
    return {
      platformId: platform.id,
      name: platform.name,
      color: platform.color,
      total,
      recent
    };
  });

  return {
    totalAccounts: state.accounts.length,
    verifiedAccounts: state.accounts.filter((account) => account.status === "verified").length,
    pendingAccounts: state.accounts.filter((account) => account.status !== "verified").length,
    loggedInProfiles: state.accounts.filter((account) => account.sessionStatus === "logged_in").length,
    savedPosts: savedEvents.length,
    comments: commentEvents.length,
    reposts: repostEvents.length,
    totalAgents: state.agents.length,
    runningAgents: state.agents.filter((agent) => agent.status === "running").length,
    pausedAgents: state.agents.filter((agent) => agent.status === "paused").length,
    activeCampaigns: state.campaigns.filter((campaign) => campaign.status === "running").length,
    flaggedAccounts: flaggedAccounts.length,
    flaggedAgents: agentSummaries.filter((agent) => agent.health === "review" || agent.health === "stale").length,
    eventsLastHour: eventsLastHour.length,
    totalEvents: state.events.length,
    averageDetectionScore: scoredAccounts.length
      ? Math.round(scoredAccounts.reduce((sum, item) => sum + item.score, 0) / scoredAccounts.length)
      : 0,
    platformActivity
  };
}

export function getStateSnapshot() {
  const detectionScores = state.accounts.map(scoreAccount);
  const scoresByAccount = new Map(detectionScores.map((item) => [item.accountId, item]));

  return {
    generatedAt: iso(),
    platforms: state.platforms,
    deviceProfiles: state.deviceProfiles,
    posts: state.posts,
    campaigns: state.campaigns,
    accounts: state.accounts.map((account) => ({
      ...account,
      detection: scoresByAccount.get(account.id),
      summary: summarizeProfile(account)
    })),
    agents: state.agents.map((agent) => ({
      ...agent,
      summary: summarizeAgent(agent)
    })),
    savedItems: state.events
      .filter((event) => ["save", "comment", "repost"].includes(event.action))
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
      .slice(0, 100),
    events: [...state.events].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)).slice(0, 250),
    otpQueue: state.otpQueue.filter((otp) => !otp.usedAt),
    detectionRules,
    analytics: getAnalytics()
  };
}

export function getRawState() {
  return state;
}
