const API_URL = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_SCRIPT_URL || "";
const UPLOAD_TOKEN = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_UPLOAD_TOKEN || "";

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export const DRIVE_DEPLOY_HINT =
  "Apps Script → Deploy → Manage deployments → Edit → Who has access must be Anyone (anonymous). Not “Anyone with a Google account”. Then Deploy a new version, paste the new /exec URL if it changed, and restart npm run dev.";

export function isDriveConfigured() {
  return Boolean(API_URL && UPLOAD_TOKEN);
}

function jsonpRequest(requestUrl) {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("Drive API requires a browser"));
  }

  return new Promise((resolve, reject) => {
    const callbackName = `_weddingDrive_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error(`Drive request timed out. ${DRIVE_DEPLOY_HINT}`));
    }, 45000);

    window[callbackName] = (data) => {
      window.clearTimeout(timeout);
      cleanup();
      resolve(data);
    };

    const script = document.createElement("script");
    const url = new URL(requestUrl);
    url.searchParams.set("callback", callbackName);
    script.src = url.toString();
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      cleanup();
      reject(
        new Error(
          `Could not load photos (JSONP failed — redeploy google-drive/Code.gs). ${DRIVE_DEPLOY_HINT}`
        )
      );
    };

    function cleanup() {
      try {
        delete window[callbackName];
      } catch {
        window[callbackName] = undefined;
      }
      script.remove();
    }

    document.head.appendChild(script);
  });
}

function parseJsonText(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(`Empty response from Drive script. ${DRIVE_DEPLOY_HINT}`);
  }

  if (
    trimmed.startsWith("<!DOCTYPE") ||
    trimmed.startsWith("<html") ||
    trimmed.includes("accounts.google.com")
  ) {
    throw new Error(
      `Google returned a sign-in page instead of your script. ${DRIVE_DEPLOY_HINT}`
    );
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }

  if (trimmed.startsWith("payload=")) {
    const decoded = decodeURIComponent(trimmed.slice("payload=".length));
    return JSON.parse(decoded);
  }

  const jsonpMatch = trimmed.match(/^[a-zA-Z_$][\w.$]*\(([\s\S]*)\);?\s*$/);
  if (jsonpMatch) {
    return JSON.parse(jsonpMatch[1]);
  }

  throw new Error(
    `Unexpected Drive response. Redeploy Code.gs and set access to Anyone. ${DRIVE_DEPLOY_HINT}`
  );
}

async function parseJsonResponse(res) {
  const text = await res.text();
  return parseJsonText(text);
}

async function postToDrive(body) {
  const payload = JSON.stringify(body);

  const attempts = [
    {
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: payload,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: `payload=${encodeURIComponent(payload)}`,
    },
  ];

  let lastError;
  for (const attempt of attempts) {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        redirect: "follow",
        headers: attempt.headers,
        body: attempt.body,
      });
      return await parseJsonResponse(res);
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError instanceof TypeError) {
    throw new Error(`Upload blocked (network/CORS). ${DRIVE_DEPLOY_HINT}`);
  }
  throw lastError;
}

export async function listDrivePhotos(category) {
  const url = new URL(API_URL);
  url.searchParams.set("action", "list");
  url.searchParams.set("category", category);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    });
    const data = await parseJsonResponse(res);
    if (data.error) throw new Error(data.error);
    return data.files || [];
  } catch (fetchErr) {
    try {
      const data = await jsonpRequest(url.toString());
      if (data.error) throw new Error(data.error);
      return data.files || [];
    } catch {
      throw fetchErr instanceof Error
        ? fetchErr
        : new Error(String(fetchErr));
    }
  }
}

function readFileAsBase64(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress({
        phase: "reading",
        filePercent: Math.round((event.loaded / event.total) * 100),
      });
    };
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read file"));
        return;
      }
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

const IFRAME_UPLOAD_MS = 180000;
const POLL_INTERVAL_MS = 2000;

/**
 * Form POST into a hidden iframe (no CORS), then confirm success by polling Drive list.
 * Google’s iframe sandbox blocks postMessage to the parent, so we don’t rely on it.
 */
async function postToDriveViaIframe(body, onProgress) {
  if (typeof document === "undefined") {
    throw new Error("Upload requires a browser");
  }

  const action = (body.action || "").toLowerCase();
  const category = body.category;
  const fileName = body.name;
  const fileId = body.fileId;

  let beforeIds = new Set();
  if (action === "upload" && category) {
    try {
      const before = await listDrivePhotos(category);
      beforeIds = new Set(before.map((f) => f.id));
    } catch {
      beforeIds = new Set();
    }
  } else if (action === "delete" && category) {
    try {
      const before = await listDrivePhotos(category);
      beforeIds = new Set(before.map((f) => f.id));
      if (fileId && !beforeIds.has(fileId)) {
        return { ok: true };
      }
    } catch {
      /* continue with delete attempt */
    }
  }

  return new Promise((resolve, reject) => {
    const frameName = `wedding-drive-${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = frameName;
    iframe.title = "Uploading to Google Drive";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:0;visibility:hidden";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = API_URL;
    form.target = frameName;
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(body);
    form.appendChild(input);

    let settled = false;
    let fakeProgress = 0;
    let pollTimer = null;

    const progressTimer = window.setInterval(() => {
      if (!onProgress) return;
      fakeProgress = Math.min(94, fakeProgress + (fakeProgress < 60 ? 3 : 1));
      onProgress({ phase: "uploading", filePercent: fakeProgress });
    }, 400);

    const timeout = window.setTimeout(() => {
      cleanup(
        new Error(
          "Upload timed out waiting for Drive. If the file appeared in Drive, refresh the page."
        )
      );
    }, IFRAME_UPLOAD_MS);

    function cleanup(err, result) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      window.clearInterval(progressTimer);
      if (pollTimer) window.clearInterval(pollTimer);
      form.remove();
      iframe.remove();
      if (err) reject(err);
      else resolve(result);
    }

    async function pollForResult() {
      if (!category) return;
      try {
        const files = await listDrivePhotos(category);
        const ids = new Set(files.map((f) => f.id));

        if (action === "upload") {
          const newFiles = files.filter((f) => !beforeIds.has(f.id));
          const match =
            newFiles.find((f) => f.name === fileName) ||
            [...newFiles].sort((a, b) => b.createdAt - a.createdAt)[0];
          if (match) {
            onProgress?.({ phase: "uploading", filePercent: 100 });
            cleanup(null, { file: match });
          }
          return;
        }

        if (action === "delete" && fileId && !ids.has(fileId)) {
          cleanup(null, { ok: true });
        }
      } catch {
        /* keep polling until timeout */
      }
    }

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();

    window.setTimeout(() => {
      pollForResult();
      pollTimer = window.setInterval(pollForResult, POLL_INTERVAL_MS);
    }, 2500);
  });
}

function postToDriveWithProgress(body, onProgress) {
  return postToDriveViaIframe(body, onProgress);
}

/** @param {{ phase: string, filePercent: number }} update */
export function combineUploadProgress(fileIndex, fileTotal, update) {
  const readShare = 0.18;
  const uploadShare = 0.82;
  let fileUnit = 0;
  if (update.phase === "reading") {
    fileUnit = (update.filePercent / 100) * readShare;
  } else if (update.phase === "uploading") {
    fileUnit = readShare + (update.filePercent / 100) * uploadShare;
  } else {
    fileUnit = 1;
  }
  return Math.min(
    100,
    Math.round(((fileIndex + fileUnit) / fileTotal) * 100)
  );
}

export async function uploadDrivePhoto(category, file, onProgress) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Each photo must be under 12 MB. Try exporting as JPEG.");
  }

  const report = (update) => {
    if (!onProgress) return;
    onProgress({
      ...update,
      fileName: file.name,
    });
  };

  report({ phase: "reading", filePercent: 0 });
  const data = await readFileAsBase64(file, report);
  report({ phase: "uploading", filePercent: 0 });

  const payload = await postToDriveWithProgress(
    {
      action: "upload",
      token: UPLOAD_TOKEN,
      category,
      name: file.name,
      mimeType: file.type || "image/jpeg",
      data,
    },
    report
  );

  if (payload.error) throw new Error(payload.error);
  if (!payload.file) {
    throw new Error(
      `Upload did not return a file (script may be outdated or token mismatch). ${DRIVE_DEPLOY_HINT}`
    );
  }
  return payload.file;
}

export async function deleteDrivePhoto(fileId, category) {
  const payload = await postToDriveViaIframe({
    action: "delete",
    token: UPLOAD_TOKEN,
    fileId,
    category,
  });

  if (payload.error) throw new Error(payload.error);
}

const RSVP_POST_MS = 45000;

function postRsvpViaIframe(body) {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("RSVP requires a browser"));
  }

  return new Promise((resolve, reject) => {
    const frameName = `wedding-rsvp-${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = frameName;
    iframe.title = "Submitting RSVP";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:0;visibility:hidden";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = API_URL;
    form.target = frameName;
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify({ ...body, delivery: "parent" });
    form.appendChild(input);

    let settled = false;

    const timeout = window.setTimeout(() => {
      cleanup(
        new Error(
          `RSVP timed out. Redeploy google-drive/Code.gs with RSVP support and set RSVP_SPREADSHEET_ID. ${DRIVE_DEPLOY_HINT}`
        )
      );
    }, RSVP_POST_MS);

    function onMessage(event) {
      const data = event.data;
      if (!data || data.type !== "wedding-drive-upload") return;
      cleanup(null, data.payload);
    }

    function cleanup(err, result) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      form.remove();
      iframe.remove();
      if (err) reject(err);
      else resolve(result);
    }

    window.addEventListener("message", onMessage);
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
  });
}

/**
 * @param {{ name: string, contact: string, attending: string, guestCount: string, events: string[] }} rsvp
 */
export async function submitRsvp(rsvp) {
  if (!isDriveConfigured()) {
    throw new Error(
      "RSVP is not connected yet. Add Google Apps Script env vars in .env.local (see env.local.example)."
    );
  }

  const body = {
    action: "rsvp",
    token: UPLOAD_TOKEN,
    name: rsvp.name.trim(),
    contact: rsvp.contact.trim(),
    attending: rsvp.attending,
    guestCount: rsvp.guestCount,
    events: rsvp.events,
  };

  let payload;
  try {
    payload = await postToDrive(body);
  } catch {
    payload = await postRsvpViaIframe(body);
  }

  if (payload.error) throw new Error(payload.error);
  if (!payload.ok) {
    throw new Error(
      "RSVP could not be saved. Set RSVP_SPREADSHEET_ID in Code.gs and redeploy."
    );
  }
  return payload;
}
