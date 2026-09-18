// Minimal Drive API v3 REST client, scoped entirely to the hidden,
// app-only `appDataFolder` special folder — never the user's visible
// Drive. No SDK needed; these are plain fetch() calls with the Bearer
// access token from driveAuth.ts. One canonical backup file is kept
// (created once, then overwritten in place) rather than a retained
// history of dated snapshots.
const API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';
const BACKUP_FILE_NAME = 'dhan-backup.enc';

export class DriveApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function driveFetch(url: string, accessToken: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new DriveApiError(`Drive API ${response.status}: ${body.slice(0, 200)}`, response.status);
  }
  return response;
}

// null if no backup exists yet for this account (first-ever backup).
export async function findBackupFile(accessToken: string): Promise<string | null> {
  const url = `${API_BASE}/files?spaces=appDataFolder&fields=files(id)&q=${encodeURIComponent(`name='${BACKUP_FILE_NAME}'`)}`;
  const response = await driveFetch(url, accessToken);
  const json = await response.json();
  const files: { id: string }[] = json.files ?? [];
  return files.length ? files[0].id : null;
}

// Creates the backup file on first use, or overwrites the existing one's
// content on every backup after that — same file ID kept for the life of
// the account's backup, this only ever holds the single latest snapshot.
export async function uploadBackupFile(
  encryptedContent: string,
  existingFileId: string | null,
  accessToken: string,
): Promise<string> {
  if (existingFileId) {
    await driveFetch(`${UPLOAD_BASE}/files/${existingFileId}?uploadType=media`, accessToken, {
      method: 'PATCH',
      body: encryptedContent,
    });
    return existingFileId;
  }

  const boundary = 'dhan-backup-boundary';
  const metadata = JSON.stringify({ name: BACKUP_FILE_NAME, parents: ['appDataFolder'] });
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    'Content-Type: text/plain\r\n\r\n' +
    `${encryptedContent}\r\n` +
    `--${boundary}--`;

  const response = await driveFetch(`${UPLOAD_BASE}/files?uploadType=multipart&fields=id`, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  const json = await response.json();
  return json.id as string;
}

export async function downloadBackupFile(fileId: string, accessToken: string): Promise<string> {
  const response = await driveFetch(`${API_BASE}/files/${fileId}?alt=media`, accessToken);
  return response.text();
}
