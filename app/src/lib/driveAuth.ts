// Thin wrapper around @react-native-google-signin/google-signin, scoped to
// exactly what backup needs: an access token good for Drive's appDataFolder,
// and the account's stable user ID (the input to backupCrypto.ts's key
// derivation). Deliberately separate from any Firebase Auth / phone-auth
// sign-in elsewhere in the app (SignUpScreen's own "Continue with Google")
// — this is its own independent OAuth session for the backup feature only.
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from './driveAuthConfig';

const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

let configured = false;
function ensureConfigured(): void {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: [DRIVE_APPDATA_SCOPE],
  });
  configured = true;
}

export interface DriveAccount {
  id: string;
  email: string;
  name: string | null;
  photo: string | null;
}

// Tries a silent sign-in first (a previously-granted session, common on
// every app open after the first) before falling back to the interactive
// consent flow. Returns null only if the user cancels the interactive
// prompt — anything else (network failure, no Play Services) throws.
export async function signInToGoogle(): Promise<DriveAccount | null> {
  ensureConfigured();
  const silent = await GoogleSignin.signInSilently();
  if (silent.type === 'success') return toAccount(silent.data);

  const result = await GoogleSignin.signIn();
  if (result.type === 'cancelled') return null;
  return toAccount(result.data);
}

// Non-interactive — for the foreground-triggered scheduled backup
// (backupScheduler.ts), which must never surface a sign-in prompt on its
// own. Returns null if there's no existing session to resume.
export async function signInSilentlyToGoogle(): Promise<DriveAccount | null> {
  ensureConfigured();
  const result = await GoogleSignin.signInSilently();
  return result.type === 'success' ? toAccount(result.data) : null;
}

export async function signOutOfGoogle(): Promise<void> {
  ensureConfigured();
  await GoogleSignin.signOut();
}

export async function getDriveAccessToken(): Promise<string> {
  ensureConfigured();
  const { accessToken } = await GoogleSignin.getTokens();
  return accessToken;
}

function toAccount(data: { user: { id: string; email: string; name: string | null; photo: string | null } }): DriveAccount {
  return { id: data.user.id, email: data.user.email, name: data.user.name, photo: data.user.photo };
}
