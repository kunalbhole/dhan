// The one piece of this feature that needs manual setup outside the
// codebase: an OAuth 2.0 "Web application" Client ID from Google Cloud
// Console, against the same project behind android/app/google-services.json
// (package com.dhanapp). See the backup/restore plan for the exact steps —
// enable the Drive API, create the Web + Android OAuth clients, register
// the debug/release SHA-1 fingerprints against the Android client.
//
// Google Sign-In on Android needs the *Web* client's ID here (not the
// Android client's) — that's not a mistake, it's how the SDK issues a
// server-verifiable ID token even for a pure-client flow.
export const GOOGLE_WEB_CLIENT_ID = 'REPLACE_ME.apps.googleusercontent.com';
