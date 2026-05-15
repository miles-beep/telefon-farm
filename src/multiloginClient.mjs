import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

export const MULTILOGIN_DOC_URL = "https://documenter.getpostman.com/view/28533318/2s946h9Cv9";

const DEFAULT_CLOUD_BASE_URL = "https://api.multilogin.com";
const DEFAULT_LAUNCHER_BASE_URL = "https://launcher.mlx.yt:45001";
const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOBILE_X_MACRO_PATH = path.resolve(__dirname, "../scripts/open-mobile-x.swift");
const DEFAULT_X_APP_ID = "1556606452280463360";

const READ_ONLY_OPERATIONS = {
  launcherVersion: {
    label: "Launcher version",
    method: "GET",
    base: "launcher",
    path: "/api/v1/version",
    needsToken: false
  },
  allProfileStatuses: {
    label: "All profile statuses",
    method: "GET",
    base: "launcher",
    path: "/api/v1/profile/statuses",
    needsToken: false
  },
  quickProfileStatuses: {
    label: "Quick profile statuses",
    method: "GET",
    base: "launcher",
    path: "/api/v1/profile/quick/statuses",
    needsToken: false
  },
  loadedBrowserCores: {
    label: "Loaded browser cores",
    method: "GET",
    base: "launcher",
    path: "/api/v1/loaded_browser_cores",
    needsToken: false
  },
  browserCoreList: {
    label: "Browser core list",
    method: "GET",
    base: "cloud",
    path: "/bcs/core/list",
    needsToken: true
  },
  userWorkspaces: {
    label: "User workspaces",
    method: "GET",
    base: "cloud",
    path: "/user/workspaces",
    needsToken: true
  },
  workspaceRestrictions: {
    label: "Workspace restrictions",
    method: "GET",
    base: "cloud",
    path: "/workspace/restrictions",
    needsToken: true
  },
  workspaceFolders: {
    label: "Workspace folders",
    method: "GET",
    base: "cloud",
    path: "/workspace/folders",
    needsToken: true
  },
  workspaceStatistics: {
    label: "Workspace statistics",
    method: "GET",
    base: "cloud",
    path: "/workspace/statistics",
    needsToken: true
  }
};

const CONTROL_OPERATIONS = {
  profileSearch: {
    label: "Search profiles",
    method: "POST",
    base: "cloud",
    path: "/profile/search",
    needsToken: true
  },
  profileStatus: {
    label: "Profile status",
    method: "GET",
    base: "launcher",
    path: "/api/v1/profile/status/p/:profile_id",
    needsToken: true
  },
  profileStart: {
    label: "Start browser profile",
    method: "GET",
    base: "launcher",
    path: "/api/v2/profile/f/:folder_id/p/:profile_id/start",
    needsToken: true
  },
  profileStop: {
    label: "Stop browser profile",
    method: "GET",
    base: "launcher",
    path: "/api/v1/profile/stop/p/:profile_id",
    needsToken: true
  }
};

const BLOCKED_CATEGORIES = [
  "Creating quick profiles",
  "Creating, updating, cloning, moving, deleting, or restoring profiles",
  "Proxy generation, validation, or assignment",
  "Cookie import, export, or pre-made cookie management",
  "Script Runner start/stop operations",
  "Profile import/export and object storage mutation",
  "Bookmark import/copy/export operations",
  "2FA setup, verification, backup code, or device mutation",
  "Automating third-party websites, social actions, likes, comments, saves, reposts, or follows"
];

function normalizeBaseUrl(value, fallback) {
  const raw = String(value || fallback).trim();
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

function normalizeFilePath(value, fallback) {
  const raw = String(value || fallback).trim();
  if (raw.startsWith("~/")) return path.join(os.homedir(), raw.slice(2));
  return raw;
}

function operationToPublicShape([id, operation]) {
  return {
    id,
    label: operation.label,
    method: operation.method,
    base: operation.base,
    path: operation.path,
    needsToken: operation.needsToken
  };
}

export function getMultiloginConfig(env = process.env) {
  const xcliPath = normalizeFilePath(env.MULTILOGIN_XCLI_PATH, "~/mlx/deps/cli/xcli");
  return {
    enabled: env.MULTILOGIN_ENABLED === "true",
    hasToken: Boolean(env.MULTILOGIN_TOKEN),
    cloudBaseUrl: normalizeBaseUrl(env.MULTILOGIN_CLOUD_BASE_URL, DEFAULT_CLOUD_BASE_URL),
    launcherBaseUrl: normalizeBaseUrl(env.MULTILOGIN_LAUNCHER_BASE_URL, DEFAULT_LAUNCHER_BASE_URL),
    xcliPath,
    hasXcli: existsSync(xcliPath),
    timeoutMs: Number(env.MULTILOGIN_TIMEOUT_MS || 8000)
  };
}

export function getMultiloginOverview(env = process.env) {
  const config = getMultiloginConfig(env);
  return {
    source: {
      name: "Multilogin API Postman docs",
      url: MULTILOGIN_DOC_URL
    },
    config: {
      enabled: config.enabled,
      hasToken: config.hasToken,
      cloudBaseUrl: config.cloudBaseUrl,
      launcherBaseUrl: config.launcherBaseUrl,
      hasXcli: config.hasXcli,
      timeoutMs: config.timeoutMs
    },
    safeOperations: Object.entries(READ_ONLY_OPERATIONS).map(operationToPublicShape),
    controlOperations: Object.entries(CONTROL_OPERATIONS).map(operationToPublicShape),
    blockedCategories: BLOCKED_CATEGORIES
  };
}

function buildOperationUrl(config, operation) {
  const baseUrl = operation.base === "launcher" ? config.launcherBaseUrl : config.cloudBaseUrl;
  return `${baseUrl}${operation.path}`;
}

async function fetchJsonWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    const text = await response.text();
    let payload = null;

    if (text.trim()) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
    }

    return {
      ok: response.ok,
      httpStatus: response.status,
      statusText: response.statusText,
      payload
    };
  } finally {
    clearTimeout(timeout);
  }
}

function buildHeaders(config, env, hasBody = false) {
  const headers = {
    Accept: "application/json"
  };

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (config.hasToken) {
    headers.Authorization = `Bearer ${env.MULTILOGIN_TOKEN}`;
  }

  return headers;
}

function requireEnabled(config) {
  if (!config.enabled) {
    throw new Error("Multilogin integration is disabled. Set MULTILOGIN_ENABLED=true to enable controls.");
  }
}

function requireToken(config) {
  if (!config.hasToken) {
    throw new Error("This Multilogin operation needs MULTILOGIN_TOKEN.");
  }
}

function messageFromPayload(payload) {
  return payload?.status?.message || payload?.message || payload?.error || payload?.raw || "Multilogin request failed.";
}

function assertOk(result, label) {
  if (result.ok) return;
  throw new Error(`${label} failed (${result.httpStatus}): ${messageFromPayload(result.payload)}`);
}

function encodeSegment(value) {
  return encodeURIComponent(String(value || "").trim());
}

async function callMultiloginEndpoint(operation, { body = null, path = operation.path, env = process.env } = {}) {
  const config = getMultiloginConfig(env);
  requireEnabled(config);

  if (operation.needsToken) {
    requireToken(config);
  }

  const baseUrl = operation.base === "launcher" ? config.launcherBaseUrl : config.cloudBaseUrl;
  const url = `${baseUrl}${path}`;
  const hasBody = body !== null && body !== undefined;
  const result = await fetchJsonWithTimeout(
    url,
    {
      method: operation.method,
      headers: buildHeaders(config, env, hasBody),
      body: hasBody ? JSON.stringify(body) : undefined
    },
    config.timeoutMs
  );

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: operation.label,
      method: operation.method,
      base: operation.base,
      path,
      url
    },
    response: result
  };
}

function firstArray(...values) {
  return values.find((value) => Array.isArray(value)) ?? [];
}

function normalizeProfile(profile) {
  const id = profile.id ?? profile.profile_id ?? profile.profileId ?? profile.browser_profile_id ?? "";
  const folderId = profile.folder_id ?? profile.folderId ?? profile.folder?.id ?? profile.folder?.folder_id ?? "";
  return {
    id,
    name: profile.name ?? profile.profile_name ?? profile.title ?? id,
    folderId,
    folderName: profile.folder_name ?? profile.folderName ?? profile.folder?.name ?? "",
    profileType: "browser",
    browserType: profile.browser_type ?? profile.browserType ?? profile.browser ?? "",
    osType: profile.os_type ?? profile.osType ?? profile.os ?? "",
    serialNumber: profile.serial_number ?? profile.serialNo ?? profile.serial_no ?? "",
    status: profile.status ?? profile.profile_status ?? profile.state ?? "unknown",
    createdAt: profile.created_at ?? profile.createdAt ?? "",
    updatedAt: profile.updated_at ?? profile.updatedAt ?? "",
    lastUsedAt: profile.last_used ?? profile.lastUsedAt ?? profile.last_activity_at ?? "",
    raw: profile
  };
}

function normalizeFolder(folder) {
  const id = folder.id ?? folder.folder_id ?? folder.folderId ?? "";
  return {
    id,
    name: folder.name ?? folder.title ?? id,
    profileCount: folder.profile_count ?? folder.profileCount ?? null,
    raw: folder
  };
}

function extractProfiles(payload) {
  const data = payload?.data ?? payload ?? {};
  return firstArray(data.profiles, data.items, data.data, payload?.profiles, payload?.items).map(normalizeProfile);
}

function extractFolders(payload) {
  const data = payload?.data ?? payload ?? {};
  return firstArray(data.folders, data.items, data.data, payload?.folders, payload?.items).map(normalizeFolder);
}

function profileTotal(payload, profiles) {
  const data = payload?.data ?? payload ?? {};
  return data.total_count ?? data.total ?? payload?.total_count ?? payload?.total ?? profiles.length;
}

function collectStatuses(value, output = new Map()) {
  if (!value) return output;

  if (Array.isArray(value)) {
    for (const item of value) collectStatuses(item, output);
    return output;
  }

  if (typeof value !== "object") return output;

  const id = value.profile_id ?? value.profileId ?? value.id ?? value.browser_profile_id;
  const status = value.status ?? value.state ?? value.profile_status;
  if (id && status) {
    output.set(String(id), String(status));
  }

  for (const [key, nested] of Object.entries(value)) {
    if (/^[0-9a-f-]{24,}$/i.test(key) && typeof nested === "string") {
      output.set(key, nested);
      continue;
    }
    collectStatuses(nested, output);
  }

  return output;
}

async function runXcli(args, env = process.env) {
  const config = getMultiloginConfig(env);
  requireEnabled(config);

  if (!config.hasXcli) {
    throw new Error(`Multilogin CLI was not found at ${config.xcliPath}.`);
  }

  try {
    const { stdout } = await execFileAsync(config.xcliPath, args, {
      timeout: config.timeoutMs,
      maxBuffer: 1024 * 1024
    });
    return stdout;
  } catch (error) {
    const output = String(`${error.stdout || ""}\n${error.stderr || ""}`).trim();
    const message = String(output || error.message || "xcli request failed").split("\n").find(Boolean);
    throw new Error(`Multilogin CLI failed: ${message}`);
  }
}

function isSoftMobileCliError(error) {
  return /unexpected response|failed to get profiles starting urls|starting urls/i.test(String(error?.message || error || ""));
}

function parseXcliBlocks(stdout) {
  return String(stdout)
    .split(/\n-{10,}\n/g)
    .map((block) => {
      const fields = {};
      for (const line of block.split("\n")) {
        const match = line.match(/^([A-Za-z][A-Za-z0-9 ]*)\s*:\s*(.*)$/);
        if (!match) continue;
        fields[match[1].replace(/\s+/g, "")] = match[2].trim();
      }
      return fields;
    })
    .filter((fields) => fields.ID);
}

function parseMobileAppList(stdout) {
  return String(stdout)
    .split(/\n(?=\d+\.\s+)/)
    .map((block) => {
      const title = block.match(/^\s*\d+\.\s+(.+)$/m)?.[1]?.trim() || "";
      const appId = block.match(/^\s*-\s+ID:\s*(\d+)/m)?.[1] || "";
      const versions = [...block.matchAll(/\*\s+(.+?)\s+\(Code\s+[^,]+,\s+ID\s+(\d+)\)/g)].map((match) => ({
        label: match[1].trim(),
        id: match[2]
      }));
      return {
        title,
        id: appId,
        versions
      };
    })
    .filter((app) => app.id && app.title);
}

async function findMobileXApp(env = process.env) {
  const configuredAppId = String(env.MULTILOGIN_X_APP_ID || "").trim();
  const configuredVersionId = String(env.MULTILOGIN_X_APP_VERSION_ID || "").trim();
  if (configuredAppId && configuredVersionId) {
    return {
      id: configuredAppId,
      versionId: configuredVersionId,
      title: "X(Twitter)"
    };
  }

  const stdout = await runXcli(["mobile-profiles-app-list", "--key", "Twitter", "--page_size", "20"], env);
  const app = parseMobileAppList(stdout).find((item) => /(^x\b|twitter)/i.test(item.title)) ?? null;
  const version = app?.versions?.[0] ?? null;

  return {
    id: configuredAppId || app?.id || DEFAULT_X_APP_ID,
    versionId: configuredVersionId || version?.id || "",
    title: app?.title || "X(Twitter)"
  };
}

function mapMobileStatus(status) {
  const raw = String(status || "unknown");
  const known = {
    0: "created",
    1: "starting",
    2: "ready",
    3: "running",
    4: "stopping",
    5: "stopped",
    6: "error"
  };
  return known[raw] || `status_${raw}`;
}

function normalizeMobileProfile(fields) {
  return {
    id: fields.ID ?? "",
    name: fields.Name || fields.SerialName || fields.ID || "",
    folderId: fields.FolderID || fields.GroupID || "",
    folderName: fields.GroupName || "",
    profileType: "mobile",
    browserType: "cloud phone",
    osType: fields.OSVersion || "",
    serialNumber: fields.SerialNo || "",
    status: mapMobileStatus(fields.Status),
    remark: fields.Remark || "",
    device: [fields.Brand, fields.MobileType].filter(Boolean).join(" "),
    country: fields.Country || "",
    timezone: fields.Timezone || "",
    rawStatus: fields.Status || ""
  };
}

function filterProfiles(profiles, search) {
  const query = String(search || "").trim().toLowerCase();
  if (!query) return profiles;

  return profiles.filter((profile) =>
    [profile.id, profile.name, profile.folderName, profile.folderId, profile.serialNumber, profile.remark, profile.device]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))
  );
}

async function searchMultiloginMobileProfiles(options = {}, env = process.env) {
  const limit = Math.max(1, Math.min(100, Number(options.limit || 50)));
  const page = Math.max(1, Math.floor(Number(options.offset || 0) / limit) + 1);
  const args = ["mobile-profiles-phone-list", "--page-size", String(limit), "--page", String(page)];

  if (options.folderId) {
    args.push("--folder-id", String(options.folderId));
  }

  const stdout = await runXcli(args, env);
  const profiles = filterProfiles(parseXcliBlocks(stdout).map(normalizeMobileProfile), options.search);

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: "Mobile profile search",
      method: "xcli",
      base: "local",
      path: "mobile-profiles-phone-list"
    },
    profiles,
    total: profiles.length
  };
}

async function getWorkspaceFolders(env = process.env) {
  const result = await callMultiloginEndpoint(READ_ONLY_OPERATIONS.workspaceFolders, { env });
  assertOk(result.response, "Workspace folders");
  return {
    ...result,
    folders: extractFolders(result.response.payload)
  };
}

export async function getMultiloginProfileStatuses(profileId = "", env = process.env) {
  const operation = profileId
    ? {
        ...CONTROL_OPERATIONS.profileStatus,
        path: `/api/v1/profile/status/p/${encodeSegment(profileId)}`
      }
    : READ_ONLY_OPERATIONS.allProfileStatuses;
  const result = await callMultiloginEndpoint(operation, { path: operation.path, env });

  return {
    ...result,
    statuses: Object.fromEntries(collectStatuses(result.response.payload))
  };
}

export async function searchMultiloginProfiles(options = {}, env = process.env) {
  const limit = Math.max(1, Math.min(100, Number(options.limit || 50)));
  const offset = Math.max(0, Number(options.offset || 0));
  const body = {
    is_removed: false,
    limit,
    offset,
    search_text: String(options.search || "").trim(),
    storage_type: "all",
    order_by: "created_at",
    sort: "asc"
  };

  if (options.folderId) {
    body.folder_id = String(options.folderId);
  }

  const [profileResult, statusResult, folderResult, mobileResult] = await Promise.all([
    callMultiloginEndpoint(CONTROL_OPERATIONS.profileSearch, { body, env }),
    getMultiloginProfileStatuses("", env).catch((error) => ({ error: error.message, statuses: {} })),
    getWorkspaceFolders(env).catch((error) => ({ error: error.message, folders: [] })),
    searchMultiloginMobileProfiles(options, env).catch((error) => ({ error: error.message, profiles: [], total: 0 }))
  ]);

  assertOk(profileResult.response, "Profile search");

  const statuses = statusResult.statuses ?? {};
  const folders = folderResult.folders ?? [];
  const folderNames = new Map(folders.map((folder) => [folder.id, folder.name]));
  const browserProfiles = extractProfiles(profileResult.response.payload).map((profile) => ({
    ...profile,
    folderName: profile.folderName || folderNames.get(profile.folderId) || "",
    status: statuses[profile.id] || profile.status
  }));
  const profiles = [...browserProfiles, ...(mobileResult.profiles ?? [])];

  return {
    ...profileResult,
    profiles,
    total: profileTotal(profileResult.response.payload, browserProfiles) + (mobileResult.total ?? mobileResult.profiles?.length ?? 0),
    folders,
    statusWarning: statusResult.error || null,
    folderWarning: folderResult.error || null,
    mobileWarning: mobileResult.error || null
  };
}

export async function startMultiloginMobileProfile({ profileId } = {}, env = process.env) {
  if (!profileId) {
    throw new Error("Starting a Multilogin mobile profile requires profileId.");
  }

  let stdout = "";
  try {
    stdout = await runXcli(["mobile-profiles-phone-start", "--ids", String(profileId)], env);
  } catch (error) {
    throw new Error(
      `${error.message}. Background start is Multilogin's mobile proxy-start path; if it fails, use Viewer to launch the cloud phone.`
    );
  }

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: "Start mobile profile in background",
      method: "xcli",
      base: "local",
      path: "mobile-profiles-phone-start"
    },
    response: {
      ok: true,
      httpStatus: 200,
      statusText: "OK",
      payload: { message: "Mobile profile background start requested." }
    },
    output: stdout ? "ok" : "ok"
  };
}

export async function openMultiloginMobileViewer({ profileId } = {}, env = process.env) {
  if (!profileId) {
    throw new Error("Opening a Multilogin mobile viewer requires profileId.");
  }

  let stdout = "";
  let launchWarning = null;
  try {
    stdout = await runXcli(["mobile-phone-launch", "--ids", String(profileId)], env);
  } catch (error) {
    if (!isSoftMobileCliError(error)) throw error;
    launchWarning = error.message;
  }

  return {
    requestedAt: new Date().toISOString(),
    uncertain: Boolean(launchWarning),
    request: {
      label: "Open mobile profile viewer",
      method: "xcli",
      base: "local",
      path: "mobile-phone-launch"
    },
    response: {
      ok: !launchWarning,
      httpStatus: launchWarning ? 202 : 200,
      statusText: launchWarning ? "Unconfirmed" : "OK",
      payload: {
        message: launchWarning
          ? "Viewer launch was requested, but Multilogin did not return a clean launch URL."
          : "Mobile profile viewer launch requested.",
        launchWarning
      }
    },
    output: stdout ? "ok" : "ok"
  };
}

export async function installMultiloginMobileXApp({ groupId } = {}, env = process.env) {
  if (!groupId) {
    throw new Error("Installing X on a Multilogin mobile profile requires the mobile group ID.");
  }

  const app = await findMobileXApp(env);
  if (!app.versionId) {
    throw new Error("Could not resolve a Multilogin X(Twitter) app version ID. Set MULTILOGIN_X_APP_VERSION_ID to override.");
  }

  const stdout = await runXcli(
    ["mobile-profiles-app-install", "--id", app.id, "--version_id", app.versionId, "--install_group_ids", String(groupId)],
    env
  );

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: "Install X mobile app",
      method: "xcli",
      base: "local",
      path: "mobile-profiles-app-install"
    },
    app,
    response: {
      ok: true,
      httpStatus: 200,
      statusText: "OK",
      payload: { message: `X app install requested for mobile group ${groupId}.` }
    },
    output: stdout ? "ok" : "ok"
  };
}

async function runMobileXUiMacro({ profileId } = {}, env = process.env) {
  if (process.platform !== "darwin") {
    throw new Error("The mobile X opener macro is only available on macOS.");
  }
  if (!existsSync(MOBILE_X_MACRO_PATH)) {
    throw new Error(`Mobile X opener macro was not found at ${MOBILE_X_MACRO_PATH}.`);
  }

  const { stdout } = await execFileAsync("/usr/bin/swift", [MOBILE_X_MACRO_PATH, String(profileId || "")], {
    timeout: Number(env.MULTILOGIN_UI_MACRO_TIMEOUT_MS || 12000),
    maxBuffer: 256 * 1024
  });

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: "Open X with local macOS UI macro",
      method: "swift",
      base: "local",
      path: "scripts/open-mobile-x.swift"
    },
    response: {
      ok: true,
      httpStatus: 200,
      statusText: "OK",
      payload: { message: "Mobile X opener macro completed." }
    },
    output: stdout.trim() || "ok"
  };
}

export async function openMultiloginMobileX({ profileId, groupId, ensureInstalled = false, runUiMacro = true } = {}, env = process.env) {
  if (!profileId) {
    throw new Error("Opening X on a Multilogin mobile profile requires profileId.");
  }

  let installResult = null;
  let installWarning = null;
  if (ensureInstalled) {
    try {
      installResult = await installMultiloginMobileXApp({ groupId }, env);
    } catch (error) {
      installWarning = error.message;
    }
  }

  const viewerResult = await openMultiloginMobileViewer({ profileId }, env);
  let macroResult = null;
  let macroWarning = null;
  const viewerWarning = viewerResult.response?.payload?.launchWarning || null;

  if (runUiMacro) {
    await new Promise((resolve) => setTimeout(resolve, Number(env.MULTILOGIN_UI_MACRO_DELAY_MS || 1800)));
    try {
      macroResult = await runMobileXUiMacro({ profileId }, env);
    } catch (error) {
      macroWarning = error.message;
    }
  }

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: "Open mobile profile to X",
      method: "xcli+macro",
      base: "local",
      path: "mobile-phone-launch + scripts/open-mobile-x.swift"
    },
    response: {
      ok: !macroWarning && !viewerWarning,
      httpStatus: macroWarning || viewerWarning ? 207 : 200,
      statusText: macroWarning || viewerWarning ? "Partial" : "OK",
      payload: {
        message: macroWarning || viewerWarning
          ? "Viewer/Open X was requested, but Multilogin did not return a clean confirmation."
          : "Viewer opened and X opener macro completed.",
        viewerWarning,
        installWarning,
        macroWarning
      }
    },
    viewerResult,
    installResult,
    macroResult,
    viewerWarning,
    installWarning,
    macroWarning
  };
}

export async function stopMultiloginMobileProfile({ profileId } = {}, env = process.env) {
  if (!profileId) {
    throw new Error("Stopping a Multilogin mobile profile requires profileId.");
  }

  const attempts = [
    {
      path: "mobile-phone-shutdown",
      args: ["mobile-phone-shutdown", "--ids", String(profileId)]
    },
    {
      path: "mobile-profiles-phone-stop",
      args: ["mobile-profiles-phone-stop", "--ids", String(profileId)]
    }
  ];
  const results = [];
  const warnings = [];

  for (const attempt of attempts) {
    try {
      const stdout = await runXcli(attempt.args, env);
      results.push({
        path: attempt.path,
        output: stdout ? "ok" : "ok"
      });
    } catch (error) {
      warnings.push(`${attempt.path}: ${error.message}`);
    }
  }

  if (!results.length) {
    throw new Error(`Stopping mobile profile failed. ${warnings.join(" | ")}`);
  }

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: "Stop mobile profile",
      method: "xcli",
      base: "local",
      path: "mobile-phone-shutdown + mobile-profiles-phone-stop"
    },
    response: {
      ok: !warnings.length,
      httpStatus: warnings.length ? 207 : 200,
      statusText: warnings.length ? "Partial" : "OK",
      payload: {
        message: warnings.length
          ? "Mobile stop was requested, but one Multilogin stop path returned a warning."
          : "Mobile profile stop requested.",
        warnings
      }
    },
    results,
    output: "ok"
  };
}

export async function startMultiloginProfile({ profileId, folderId } = {}, env = process.env) {
  if (!profileId || !folderId) {
    throw new Error("Starting a Multilogin profile requires both profileId and folderId.");
  }

  const path = `/api/v2/profile/f/${encodeSegment(folderId)}/p/${encodeSegment(profileId)}/start`;
  const result = await callMultiloginEndpoint(CONTROL_OPERATIONS.profileStart, { path, env });
  assertOk(result.response, "Profile start");
  return result;
}

export async function stopMultiloginProfile({ profileId } = {}, env = process.env) {
  if (!profileId) {
    throw new Error("Stopping a Multilogin profile requires profileId.");
  }

  const path = `/api/v1/profile/stop/p/${encodeSegment(profileId)}`;
  const result = await callMultiloginEndpoint(CONTROL_OPERATIONS.profileStop, { path, env });
  assertOk(result.response, "Profile stop");
  return result;
}

export async function callMultiloginReadOnly(operationId, env = process.env) {
  const config = getMultiloginConfig(env);
  const operation = READ_ONLY_OPERATIONS[operationId];

  if (!operation) {
    throw new Error("Unsupported Multilogin operation.");
  }

  requireEnabled(config);

  if (operation.needsToken) requireToken(config);

  const url = buildOperationUrl(config, operation);

  const result = await fetchJsonWithTimeout(
    url,
    {
      method: operation.method,
      headers: buildHeaders(config, env)
    },
    config.timeoutMs
  );

  return {
    requestedAt: new Date().toISOString(),
    request: {
      operationId,
      label: operation.label,
      method: operation.method,
      base: operation.base,
      path: operation.path,
      url
    },
    response: result
  };
}
