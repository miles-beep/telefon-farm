const configuredBaseUrl = process.env.TELEPHONES_BASE_URL
  ? [process.env.TELEPHONES_BASE_URL]
  : ["http://localhost:5180", "http://localhost:5177"];
let activeBaseUrl = configuredBaseUrl[0].replace(/\/$/, "");
const [, , command, ...args] = process.argv;

function usage() {
  console.log(`Usage:
  npm run mlx -- status
  npm run mlx -- profiles [search text]
  npm run mlx -- start <profile_id> [folder_id]
  npm run mlx -- stop <profile_id>

Environment:
  TELEPHONES_BASE_URL=${activeBaseUrl}`);
}

async function request(path, options = {}) {
  let lastError = null;

  for (const candidate of configuredBaseUrl) {
    activeBaseUrl = candidate.replace(/\/$/, "");
    try {
      const response = await fetch(`${activeBaseUrl}${path}`, {
        headers: {
          "content-type": "application/json",
          ...(options.headers ?? {})
        },
        ...options
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || `Request failed with ${response.status}`);
      }
      return payload;
    } catch (error) {
      lastError = error;
      if (configuredBaseUrl.length === 1 || !String(error.cause?.code || error.message).includes("fetch failed")) {
        throw error;
      }
    }
  }

  throw lastError;
}

function rowForProfile(profile) {
  return {
    type: profile.profileType || "browser",
    name: profile.name,
    id: profile.id,
    folder: profile.folderName || profile.folderId || "",
    folderId: profile.folderId || "",
    status: profile.status || "unknown",
    browser: profile.browserType || "",
    os: profile.osType || ""
  };
}

async function listProfiles(search = "", { silent = false } = {}) {
  const query = new URLSearchParams({
    limit: "100",
    search
  });
  const result = await request(`/api/multilogin/profiles?${query}`);
  if (!silent) console.table(result.profiles.map(rowForProfile));
  if (!silent && !result.profiles.length) {
    console.log("No Multilogin profiles found.");
  }
  return result;
}

async function resolveFolderId(profileId, folderId) {
  if (folderId) return { folderId, profileType: "browser" };

  const result = await listProfiles("", { silent: true });
  const profile = result.profiles.find((item) => item.id === profileId);
  if (profile?.profileType === "mobile") {
    return { folderId: "", profileType: "mobile" };
  }
  if (!profile?.folderId) {
    throw new Error("Could not resolve folder_id. Run `npm run mlx -- profiles` and pass the folder_id as the third argument.");
  }
  return { folderId: profile.folderId, profileType: "browser" };
}

async function main() {
  if (!command || command === "help" || command === "--help" || command === "-h") {
    usage();
    return;
  }

  if (command === "status") {
    const result = await request("/api/multilogin");
    console.log(
      JSON.stringify(
        {
          enabled: result.config.enabled,
          hasToken: result.config.hasToken,
          cloudBaseUrl: result.config.cloudBaseUrl,
          launcherBaseUrl: result.config.launcherBaseUrl,
          readOnlyOperations: result.safeOperations.length,
          controlOperations: result.controlOperations.length
        },
        null,
        2
      )
    );
    return;
  }

  if (command === "profiles") {
    await listProfiles(args.join(" "));
    return;
  }

  if (command === "start") {
    const [profileId, folderIdArg] = args;
    if (!profileId) throw new Error("Pass a profile_id to start.");
    const { folderId, profileType } = await resolveFolderId(profileId, folderIdArg);
    const result = await request(`/api/multilogin/profiles/${encodeURIComponent(profileId)}/start`, {
      method: "POST",
      body: JSON.stringify({ folderId, profileType })
    });
    console.log(`Started ${profileId}`);
    console.log(JSON.stringify(result.response.payload, null, 2));
    return;
  }

  if (command === "stop") {
    const [profileId] = args;
    if (!profileId) throw new Error("Pass a profile_id to stop.");
    const profileControl = await resolveFolderId(profileId, "").catch(() => ({
      folderId: "",
      profileType: args[1] === "mobile" ? "mobile" : "browser"
    }));
    const result = await request(`/api/multilogin/profiles/${encodeURIComponent(profileId)}/stop`, {
      method: "POST",
      body: JSON.stringify({ profileType: profileControl.profileType })
    });
    console.log(`Stopped ${profileId}`);
    console.log(JSON.stringify(result.response.payload, null, 2));
    return;
  }

  usage();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
