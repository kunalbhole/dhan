// Client-side encryption for backup payloads. crypto-js has no built-in
// AES-GCM, so this uses the standard encrypt-then-MAC construction instead:
// AES-256-CBC for confidentiality, HMAC-SHA256 (over iv+ciphertext) for
// integrity/authenticity — together an equivalent guarantee to AES-GCM.
//
// The key is derived deterministically from the signed-in Google account's
// stable user ID (PBKDF2 over a fixed app-wide salt), never from a
// user-set passphrase — that's what makes "sign in on a new device, get
// your data back" work with no separate secret to remember or lose. A
// fixed salt is a deliberate choice, not an oversight: the salt would
// itself need to be persisted somewhere that survives a reinstall for
// restore to work, which defeats the point of deriving from the account
// alone. Needs `react-native-get-random-values` imported once at the app
// entrypoint (index.js) — crypto-js has no CSPRNG of its own on RN.
import CryptoJS from 'crypto-js';

// Not a secret — this only has to be the same on every device for the same
// derivation to reproduce the same key. Real secrecy comes from the Google
// account ID being unknown to anyone who isn't signed into it.
const APP_SALT = 'dhan-backup-v1';
const PBKDF2_ITERATIONS = 100_000;
const KEY_SIZE_WORDS = 256 / 32;

// PBKDF2 at this iteration count is a real, visible cost (hundreds of ms
// to a couple seconds on a mid-range phone) — cache per account for the
// life of the JS session so it only runs once per sign-in, not on every
// encrypt/decrypt call.
let cachedAccountId: string | null = null;
let cachedMasterKey: CryptoJS.lib.WordArray | null = null;

function masterKeyFor(accountId: string): CryptoJS.lib.WordArray {
  if (cachedAccountId === accountId && cachedMasterKey) return cachedMasterKey;
  const key = CryptoJS.PBKDF2(accountId, APP_SALT, {
    keySize: KEY_SIZE_WORDS,
    iterations: PBKDF2_ITERATIONS,
  });
  cachedAccountId = accountId;
  cachedMasterKey = key;
  return key;
}

function encKeyFor(accountId: string): CryptoJS.lib.WordArray {
  return CryptoJS.HmacSHA256('dhan-backup-enc', masterKeyFor(accountId));
}

function macKeyFor(accountId: string): CryptoJS.lib.WordArray {
  return CryptoJS.HmacSHA256('dhan-backup-mac', masterKeyFor(accountId));
}

// iv, ciphertext and mac are each base64, colon-joined — the one blob
// that's actually written to the backup file in Drive's appDataFolder.
export function encryptBackup(plaintext: string, accountId: string): string {
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const ciphertext = CryptoJS.AES.encrypt(plaintext, encKeyFor(accountId), {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).ciphertext;
  const mac = CryptoJS.HmacSHA256(iv.clone().concat(ciphertext), macKeyFor(accountId));
  return [iv, ciphertext, mac].map(w => CryptoJS.enc.Base64.stringify(w)).join(':');
}

export class BackupDecryptError extends Error {}

export function decryptBackup(blob: string, accountId: string): string {
  const parts = blob.split(':');
  if (parts.length !== 3) throw new BackupDecryptError('Malformed backup file');
  const [ivB64, ciphertextB64, macB64] = parts;
  const iv = CryptoJS.enc.Base64.parse(ivB64);
  const ciphertext = CryptoJS.enc.Base64.parse(ciphertextB64);
  const mac = CryptoJS.enc.Base64.parse(macB64);

  const expectedMac = CryptoJS.HmacSHA256(iv.clone().concat(ciphertext), macKeyFor(accountId));
  if (CryptoJS.enc.Base64.stringify(expectedMac) !== CryptoJS.enc.Base64.stringify(mac)) {
    // Wrong account, corrupted upload, or tampering — all indistinguishable
    // from here, all handled the same way by the caller (fail the restore).
    throw new BackupDecryptError('Backup failed integrity check');
  }

  const decrypted = CryptoJS.AES.decrypt(
    // @ts-expect-error — crypto-js's CipherParams type wants a full object;
    // passing just the ciphertext WordArray is the documented shorthand.
    { ciphertext },
    encKeyFor(accountId),
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
  );
  return decrypted.toString(CryptoJS.enc.Utf8);
}
