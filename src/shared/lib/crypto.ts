/**
 * Device-held anonymous token management and SHA-256 hashing.
 * The raw token is stored only in localStorage on the worker's device.
 * Only the SHA-256 hash is ever stored in the database or sent to servers.
 * Absolutely no user_id is ever attached to feedback rows.
 */

const TOKEN_KEY = 'fairshift_device_anonymous_token';

export function getOrCreateDeviceAnonymousToken(): string {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = 'fs_tok_' + crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode('fairshift_salt_v1_' + token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
