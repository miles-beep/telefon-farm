import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

export const MULTILOGIN_DOC_URL = "https://documenter.getpostman.com/view/28533318/2s946h9Cv9";

const DEFAULT_CLOUD_BASE_URL = "https://api.multilogin.com";
const DEFAULT_LAUNCHER_BASE_URL = "https://launcher.mlx.yt:45001";
const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_X_APP_ID = "1556606452280463360";
const DEFAULT_X_ANDROID_PACKAGE = "com.twitter.android";
let localEnvLoaded = false;

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
  "Unsupervised or bulk third-party website actions, likes, comments, saves, reposts, or follows"
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

function loadLocalEnv(env = process.env) {
  if (localEnvLoaded) return;
  localEnvLoaded = true;

  const envPath = path.resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (Object.hasOwn(env, key)) continue;
    env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  }
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
  loadLocalEnv(env);
  const xcliPath = normalizeFilePath(env.MULTILOGIN_XCLI_PATH, "~/mlx/deps/cli/xcli");
  const hasXcli = existsSync(xcliPath);
  const hasToken = Boolean(env.MULTILOGIN_TOKEN);
  return {
    enabled: env.MULTILOGIN_ENABLED === "true" || hasToken || hasXcli,
    hasToken,
    cloudBaseUrl: normalizeBaseUrl(env.MULTILOGIN_CLOUD_BASE_URL, DEFAULT_CLOUD_BASE_URL),
    launcherBaseUrl: normalizeBaseUrl(env.MULTILOGIN_LAUNCHER_BASE_URL, DEFAULT_LAUNCHER_BASE_URL),
    xcliPath,
    hasXcli,
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

function requireXcli(config) {
  if (!config.enabled) {
    throw new Error("Multilogin integration is disabled.");
  }
  if (!config.hasXcli) {
    throw new Error(`Multilogin CLI was not found at ${config.xcliPath}.`);
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
  requireXcli(config);

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

function getAdbConfig(env = process.env) {
  loadLocalEnv(env);
  return {
    adbPath: normalizeFilePath(env.ADB_PATH || env.MULTILOGIN_ADB_PATH, "adb"),
    timeoutMs: Number(env.MULTILOGIN_ADB_TIMEOUT_MS || 12000),
    xPackageName: String(env.X_ANDROID_PACKAGE || env.MULTILOGIN_X_ANDROID_PACKAGE || DEFAULT_X_ANDROID_PACKAGE).trim()
  };
}

function envKeyForProfileAdbSerial(profileId) {
  return `MULTILOGIN_ADB_SERIAL_${String(profileId || "").replace(/[^A-Za-z0-9]/g, "_")}`;
}

function parseAdbSerialMappings(value) {
  const mappings = new Map();
  for (const entry of String(value || "").split(/[,\n;]/)) {
    const index = entry.indexOf("=");
    if (index <= 0) continue;
    const profileId = entry.slice(0, index).trim();
    const serial = entry.slice(index + 1).trim();
    if (profileId && serial) mappings.set(profileId, serial);
  }
  return mappings;
}

async function runAdb(args, env = process.env) {
  const config = getAdbConfig(env);

  try {
    const { stdout, stderr } = await execFileAsync(config.adbPath, args, {
      timeout: config.timeoutMs,
      maxBuffer: 1024 * 1024
    });
    return String(stdout || stderr || "").trim();
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("ADB was not found. Install Android platform-tools or set ADB_PATH.");
    }
    const output = String(`${error.stdout || ""}\n${error.stderr || ""}`).trim();
    const message = String(output || error.message || "adb command failed").split("\n").find(Boolean);
    throw new Error(`ADB failed: ${message}`);
  }
}

async function runAdbBuffer(args, env = process.env) {
  const config = getAdbConfig(env);

  try {
    const { stdout } = await execFileAsync(config.adbPath, args, {
      timeout: config.timeoutMs,
      maxBuffer: 12 * 1024 * 1024,
      encoding: "buffer"
    });
    return Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout || "");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error("ADB was not found. Install Android platform-tools or set ADB_PATH.");
    }
    const output = Buffer.isBuffer(error.stdout)
      ? error.stdout.toString("utf8")
      : String(`${error.stdout || ""}\n${error.stderr || ""}`).trim();
    const message = String(output || error.message || "adb command failed").split("\n").find(Boolean);
    throw new Error(`ADB failed: ${message}`);
  }
}

function parseAdbDeviceRows(stdout) {
  return String(stdout || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => {
      const match = line.match(/^(\S+)\s+(\S+)/);
      if (!match || match[1] === "List") return null;
      return {
        serial: match[1],
        status: match[2]
      };
    })
    .filter(Boolean);
}

async function listConnectedAdbDevices(env = process.env) {
  const stdout = await runAdb(["devices"], env);
  return parseAdbDeviceRows(stdout)
    .filter((device) => device.status === "device")
    .map((device) => device.serial);
}

async function resolveAdbSerial({ profileId, adbSerial } = {}, env = process.env) {
  const directSerial = String(adbSerial || "").trim();
  if (directSerial) return directSerial;

  loadLocalEnv(env);
  const profileSerial = String(env[envKeyForProfileAdbSerial(profileId)] || "").trim();
  if (profileSerial) return profileSerial;

  const mappings = parseAdbSerialMappings(env.MULTILOGIN_ADB_SERIALS);
  const mappedSerial = mappings.get(String(profileId || ""));
  if (mappedSerial) return mappedSerial;

  const defaultSerial = String(env.MULTILOGIN_ADB_SERIAL || "").trim();
  if (defaultSerial) return defaultSerial;

  const devices = await listConnectedAdbDevices(env);
  if (devices.length === 1) return devices[0];
  if (devices.length > 1) {
    throw new Error(
      `Multiple ADB devices are connected. Set ${envKeyForProfileAdbSerial(profileId)} or MULTILOGIN_ADB_SERIALS to map this profile.`
    );
  }

  throw new Error("No ADB device is connected. Enable ADB for the running Multilogin cloud phone, run adb connect, and authenticate it.");
}

async function runAdbShell({ profileId, adbSerial, shellArgs } = {}, env = process.env) {
  const serial = await resolveAdbSerial({ profileId, adbSerial }, env);
  const output = await runAdb(["-s", serial, "shell", ...shellArgs.map(String)], env);
  return { serial, output };
}

function parseAndroidScreenSize(value) {
  const match = String(value || "").match(/Physical size:\s*(\d+)x(\d+)/i) || String(value || "").match(/(\d+)x(\d+)/);
  return {
    width: Number(match?.[1] || 1080),
    height: Number(match?.[2] || 1920)
  };
}

async function getAndroidScreenSize({ profileId, adbSerial } = {}, env = process.env) {
  const result = await runAdbShell({ profileId, adbSerial, shellArgs: ["wm", "size"] }, env);
  return {
    serial: result.serial,
    ...parseAndroidScreenSize(result.output)
  };
}

function clampPoint(value, max) {
  return Math.max(0, Math.min(max, Math.round(Number(value))));
}

function resolveAndroidPoint(screen, payload = {}) {
  const width = Number(screen.width || 1080);
  const height = Number(screen.height || 1920);
  const hasAbsolute = Number.isFinite(Number(payload.x)) && Number.isFinite(Number(payload.y));
  const x = hasAbsolute ? Number(payload.x) : width * Number(payload.xRatio ?? 0.5);
  const y = hasAbsolute ? Number(payload.y) : height * Number(payload.yRatio ?? 0.5);
  return {
    x: clampPoint(x, width),
    y: clampPoint(y, height)
  };
}

function encodeAndroidInputText(text) {
  return String(text || "")
    .slice(0, 500)
    .replace(/\\/g, "\\\\")
    .replace(/\s+/g, "%s")
    .replace(/([&<>;|*~"'`()[\]{}$])/g, "\\$1");
}

function parseAdbSetupInput(payload = {}) {
  const raw = [
    payload.commandText,
    payload.connectionCommand,
    payload.authCommand,
    payload.address,
    payload.password ? `glogin ${payload.password}` : ""
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join("\n");
  const address =
    String(payload.address || "").trim() ||
    raw.match(/\badb\s+connect\s+([^\s]+)/i)?.[1] ||
    raw.match(/\b([A-Za-z0-9.-]+:\d{2,5})\b/)?.[1] ||
    "";
  const authMatch = raw.match(/\badb\s+-s\s+([^\s]+)\s+shell\s+glogin\s+([^\s]+)/i);
  const serial = authMatch?.[1] || address;
  const password = String(payload.password || "").trim() || authMatch?.[2] || raw.match(/\bglogin\s+([^\s]+)/i)?.[1] || "";

  if (!address) {
    throw new Error("Paste an ADB connect command or address from Multilogin, for example adb connect IP:PORT.");
  }

  return {
    address,
    serial,
    password
  };
}

async function readMacClipboard(env = process.env) {
  if (os.platform() !== "darwin") {
    throw new Error("Automatic ADB clipboard connect is currently supported on macOS only.");
  }
  const { stdout } = await execFileAsync("pbpaste", [], {
    timeout: Number(env.MULTILOGIN_CLIPBOARD_TIMEOUT_MS || 2500),
    maxBuffer: 256 * 1024
  });
  return String(stdout || "").trim();
}

async function swipeAndroidScreen({ profileId, adbSerial, direction = "down", count = 1 } = {}, env = process.env) {
  const size = await getAndroidScreenSize({ profileId, adbSerial }, env);
  const scrollCount = Math.max(1, Math.min(8, Number(count || 1)));
  const x = Math.round(size.width * 0.5);
  const down = String(direction || "down") !== "up";
  const startY = Math.round(size.height * (down ? 0.78 : 0.28));
  const endY = Math.round(size.height * (down ? 0.28 : 0.78));
  const durationMs = Number(env.MULTILOGIN_ADB_SWIPE_DURATION_MS || 450);
  const swipes = [];

  for (let index = 0; index < scrollCount; index += 1) {
    const swipe = await runAdbShell(
      {
        profileId,
        adbSerial: size.serial,
        shellArgs: ["input", "swipe", x, startY, x, endY, durationMs]
      },
      env
    );
    swipes.push(swipe.output || "ok");
    if (index < scrollCount - 1) {
      await new Promise((resolve) => setTimeout(resolve, Number(env.MULTILOGIN_ADB_SCROLL_PAUSE_MS || 500)));
    }
  }

  return {
    serial: size.serial,
    width: size.width,
    height: size.height,
    swipes: scrollCount,
    direction: down ? "down" : "up",
    output: swipes
  };
}

export async function getPhoneControlStatus(env = process.env) {
  const multilogin = getMultiloginConfig(env);
  const adbConfig = getAdbConfig(env);
  const adbMappings = parseAdbSerialMappings(env.MULTILOGIN_ADB_SERIALS);
  const profileSpecificAdbKeys = Object.keys(env).filter((key) => key.startsWith("MULTILOGIN_ADB_SERIAL_"));
  const configuredSerials = [
    ...adbMappings.values(),
    String(env.MULTILOGIN_ADB_SERIAL || "").trim(),
    ...profileSpecificAdbKeys.map((key) => String(env[key] || "").trim())
  ].filter(Boolean);

  const status = {
    checkedAt: new Date().toISOString(),
    multilogin: {
      available: Boolean(multilogin.enabled && multilogin.hasXcli),
      enabled: multilogin.enabled,
      hasXcli: multilogin.hasXcli,
      hasToken: multilogin.hasToken,
      controls: ["Sync profiles", "Start phone", "Open viewer", "Stop phone", "Install X"]
    },
    android: {
      available: false,
      installed: false,
      path: adbConfig.adbPath,
      devices: [],
      connectedDevices: [],
      configuredSerials,
      error: "",
      requiredFor: ["Open X app", "Scroll review", "Scroll 3x"]
    },
    explanation:
      "Multilogin controls the cloud-phone lifecycle. Android app launch and swipe commands happen inside the running phone, so they use ADB."
  };

  try {
    const stdout = await runAdb(["devices"], env);
    status.android.installed = true;
    status.android.devices = parseAdbDeviceRows(stdout);
    status.android.connectedDevices = status.android.devices
      .filter((device) => device.status === "device")
      .map((device) => device.serial);
    status.android.available = status.android.connectedDevices.length > 0;
    if (!status.android.available) {
      status.android.error = status.android.devices.length
        ? "ADB is installed, but no authorized cloud phone is connected."
        : "ADB is installed, but no cloud phone is connected.";
    }
  } catch (error) {
    status.android.error = error.message;
    status.android.installed = !/not found/i.test(error.message);
  }

  return status;
}

export async function connectAndroidPhoneControl(payload = {}, env = process.env) {
  const setup = parseAdbSetupInput(payload);
  const connectOutput = await runAdb(["connect", setup.address], env);
  let authOutput = "";

  if (setup.password) {
    authOutput = await runAdb(["-s", setup.serial, "shell", "glogin", setup.password], env);
  }

  return {
    requestedAt: new Date().toISOString(),
    address: setup.address,
    serial: setup.serial,
    connectOutput,
    authOutput,
    status: await getPhoneControlStatus(env)
  };
}

export async function autoConnectAndroidPhoneControl(payload = {}, env = process.env) {
  const currentStatus = await getPhoneControlStatus(env);
  if (currentStatus.android.available) {
    return {
      requestedAt: new Date().toISOString(),
      source: "existing_adb",
      message: "Android phone control is already connected.",
      status: currentStatus
    };
  }

  const clipboardText = await readMacClipboard(env);
  try {
    return {
      ...(await connectAndroidPhoneControl({ ...payload, commandText: clipboardText }, env)),
      source: "mac_clipboard",
      message: "Connected from the Mac clipboard."
    };
  } catch (error) {
    return {
      requestedAt: new Date().toISOString(),
      source: "mac_clipboard",
      message: "Waiting for Multilogin ADB commands in the Mac clipboard.",
      clipboardLooksUsable: false,
      error: error.message,
      status: currentStatus
    };
  }
}

function isSoftMobileCliError(error) {
  return /unexpected response|failed to get profiles starting urls|starting urls|failed to start mobile profiles|internal server error/i.test(
    String(error?.message || error || "")
  );
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

function extractMobileStatusMap(stdout) {
  return Object.fromEntries(
    parseXcliBlocks(stdout).map((fields) => [
      fields.ID,
      {
        status: mapMobileStatus(fields.Status),
        rawStatus: fields.Status || "",
        name: fields.SerialName || fields.Name || fields.ID || ""
      }
    ])
  );
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

export async function getMultiloginMobileProfileStatuses(profileIds = [], env = process.env) {
  const ids = Array.isArray(profileIds) ? profileIds.filter(Boolean) : [profileIds].filter(Boolean);
  if (!ids.length) {
    return {
      requestedAt: new Date().toISOString(),
      request: {
        label: "Mobile profile statuses",
        method: "xcli",
        base: "local",
        path: "mobile-profiles-statuses"
      },
      statuses: {}
    };
  }

  const args = ["mobile-profiles-statuses"];
  ids.forEach((profileId) => args.push("--ids", String(profileId)));
  const stdout = await runXcli(args, env);

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: "Mobile profile statuses",
      method: "xcli",
      base: "local",
      path: "mobile-profiles-statuses"
    },
    statuses: extractMobileStatusMap(stdout),
    output: stdout ? "ok" : "ok"
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
    callMultiloginEndpoint(CONTROL_OPERATIONS.profileSearch, { body, env }).catch((error) => ({
      error: error.message,
      response: { payload: null },
      profiles: [],
      total: 0
    })),
    getMultiloginProfileStatuses("", env).catch((error) => ({ error: error.message, statuses: {} })),
    getWorkspaceFolders(env).catch((error) => ({ error: error.message, folders: [] })),
    searchMultiloginMobileProfiles(options, env).catch((error) => ({ error: error.message, profiles: [], total: 0 }))
  ]);

  if (!profileResult.error) assertOk(profileResult.response, "Profile search");

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
    profileWarning: profileResult.error || null,
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
  let startWarning = null;
  try {
    stdout = await runXcli(["mobile-profiles-phone-start", "--ids", String(profileId)], env);
  } catch (error) {
    if (!isSoftMobileCliError(error)) throw error;
    startWarning = error.message;
  }

  return {
    requestedAt: new Date().toISOString(),
    uncertain: Boolean(startWarning),
    request: {
      label: "Start mobile profile in background",
      method: "xcli",
      base: "local",
      path: "mobile-profiles-phone-start"
    },
    response: {
      ok: !startWarning,
      httpStatus: startWarning ? 202 : 200,
      statusText: startWarning ? "Unconfirmed" : "OK",
      payload: {
        message: startWarning
          ? "Background start was requested, but Multilogin returned an unclear result."
          : "Mobile profile background start requested.",
        startWarning
      }
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

export async function openAndroidXApp({ profileId, adbSerial, packageName } = {}, env = process.env) {
  if (!profileId) {
    throw new Error("Opening X on a Multilogin mobile profile requires profileId.");
  }

  const config = getAdbConfig(env);
  const androidPackage = String(packageName || config.xPackageName || DEFAULT_X_ANDROID_PACKAGE).trim();
  const { serial, output } = await runAdbShell(
    {
      profileId,
      adbSerial,
      shellArgs: ["monkey", "-p", androidPackage, "-c", "android.intent.category.LAUNCHER", "1"]
    },
    env
  );

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: "Open Android X app",
      method: "adb",
      base: "local",
      path: `adb -s ${serial} shell monkey -p ${androidPackage} -c android.intent.category.LAUNCHER 1`
    },
    response: {
      ok: true,
      httpStatus: 200,
      statusText: "OK",
      payload: {
        message: `Android X app launch requested on ${serial}.`,
        packageName: androidPackage,
        adbSerial: serial
      }
    },
    output: output || "ok"
  };
}

export async function scrollAndroidXApp({ profileId, adbSerial, count = 1, packageName } = {}, env = process.env) {
  if (!profileId) {
    throw new Error("Scrolling X on a Multilogin mobile profile requires profileId.");
  }

  const openResult = await openAndroidXApp({ profileId, adbSerial, packageName }, env);
  await new Promise((resolve) => setTimeout(resolve, Number(env.MULTILOGIN_ADB_APP_FOCUS_DELAY_MS || 800)));
  const swipe = await swipeAndroidScreen({ profileId, adbSerial: openResult.response.payload.adbSerial, count, direction: "down" }, env);

  return {
    requestedAt: new Date().toISOString(),
    request: {
      label: "Scroll Android X app",
      method: "adb",
      base: "local",
      path: "adb shell monkey + input swipe"
    },
    response: {
      ok: true,
      httpStatus: 200,
      statusText: "OK",
      payload: {
        message: `Opened Android X app and sent ${swipe.swipes} feed scroll${swipe.swipes === 1 ? "" : "s"} on ${swipe.serial}.`,
        adbSerial: swipe.serial,
        swipes: swipe.swipes,
        screen: {
          width: swipe.width,
          height: swipe.height
        }
      }
    },
    openResult,
    swipes: swipe.output,
    output: "ok"
  };
}

export async function openMultiloginMobileX(options = {}, env = process.env) {
  return openAndroidXApp(options, env);
}

export async function runAndroidAssistiveCommand(
  { profileId, adbSerial, command, text, x, y, xRatio, yRatio, count = 1, direction = "down" } = {},
  env = process.env
) {
  if (!profileId) {
    throw new Error("Assistive Android commands require profileId.");
  }

  const normalizedCommand = String(command || "").trim();
  const now = new Date().toISOString();

  if (normalizedCommand === "screenshot") {
    const serial = await resolveAdbSerial({ profileId, adbSerial }, env);
    const buffer = await runAdbBuffer(["-s", serial, "exec-out", "screencap", "-p"], env);
    return {
      requestedAt: now,
      request: {
        label: "Screenshot",
        method: "adb",
        base: "local",
        path: "adb exec-out screencap -p"
      },
      response: {
        ok: true,
        httpStatus: 200,
        statusText: "OK",
        payload: {
          message: `Screenshot captured from ${serial}.`,
          adbSerial: serial,
          imageMime: "image/png",
          imageBase64: buffer.toString("base64")
        }
      },
      output: "ok"
    };
  }

  if (normalizedCommand === "scroll" || normalizedCommand === "scroll_down" || normalizedCommand === "scroll_up") {
    const swipe = await swipeAndroidScreen(
      {
        profileId,
        adbSerial,
        count,
        direction: normalizedCommand === "scroll_up" ? "up" : direction
      },
      env
    );
    return {
      requestedAt: now,
      request: {
        label: "Assistive scroll",
        method: "adb",
        base: "local",
        path: "adb shell input swipe"
      },
      response: {
        ok: true,
        httpStatus: 200,
        statusText: "OK",
        payload: {
          message: `Sent ${swipe.swipes} ${swipe.direction} scroll${swipe.swipes === 1 ? "" : "s"} on ${swipe.serial}.`,
          adbSerial: swipe.serial,
          swipes: swipe.swipes,
          direction: swipe.direction,
          screen: {
            width: swipe.width,
            height: swipe.height
          }
        }
      },
      output: "ok"
    };
  }

  if (normalizedCommand === "tap") {
    const size = await getAndroidScreenSize({ profileId, adbSerial }, env);
    const point = resolveAndroidPoint(size, { x, y, xRatio, yRatio });
    const result = await runAdbShell({ profileId, adbSerial: size.serial, shellArgs: ["input", "tap", point.x, point.y] }, env);
    return {
      requestedAt: now,
      request: {
        label: "Assistive tap",
        method: "adb",
        base: "local",
        path: "adb shell input tap"
      },
      response: {
        ok: true,
        httpStatus: 200,
        statusText: "OK",
        payload: {
          message: `Tapped ${point.x},${point.y} on ${size.serial}.`,
          adbSerial: size.serial,
          point,
          screen: {
            width: size.width,
            height: size.height
          }
        }
      },
      output: result.output || "ok"
    };
  }

  if (normalizedCommand === "type_text") {
    const safeText = encodeAndroidInputText(text);
    if (!safeText) throw new Error("Add draft text before typing.");
    const result = await runAdbShell({ profileId, adbSerial, shellArgs: ["input", "text", safeText] }, env);
    return {
      requestedAt: now,
      request: {
        label: "Type draft",
        method: "adb",
        base: "local",
        path: "adb shell input text"
      },
      response: {
        ok: true,
        httpStatus: 200,
        statusText: "OK",
        payload: {
          message: "Typed draft text into the focused Android field.",
          adbSerial: result.serial,
          characters: String(text || "").length
        }
      },
      output: result.output || "ok"
    };
  }

  const keyEvents = {
    key_back: 4,
    key_home: 3,
    key_enter: 66
  };
  if (Object.hasOwn(keyEvents, normalizedCommand)) {
    const result = await runAdbShell({ profileId, adbSerial, shellArgs: ["input", "keyevent", keyEvents[normalizedCommand]] }, env);
    return {
      requestedAt: now,
      request: {
        label: normalizedCommand.replace("key_", "Key "),
        method: "adb",
        base: "local",
        path: "adb shell input keyevent"
      },
      response: {
        ok: true,
        httpStatus: 200,
        statusText: "OK",
        payload: {
          message: `${normalizedCommand.replace("key_", "").toUpperCase()} sent to ${result.serial}.`,
          adbSerial: result.serial
        }
      },
      output: result.output || "ok"
    };
  }

  throw new Error(`Unsupported assistive Android command: ${normalizedCommand}`);
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
