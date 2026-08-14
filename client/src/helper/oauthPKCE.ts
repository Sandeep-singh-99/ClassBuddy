// Generate random code verifier (RFC 7636)
export function generateCodeVerifier(length = 64): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => possible[byte % possible.length]).join("");
}

// Generate S256 code challenge from verifier using Web Crypto API
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  
  // Base64URL encode
  const bytes = new Uint8Array(digest);
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Generate random state parameter
export function generateState(length = 32): string {
  return generateCodeVerifier(length);
}

// Helper to store/retrieve temporary PKCE transaction context
export const oauthStorage = {
  savePKCEContext: (verifier: string, state: string) => {
    sessionStorage.setItem("pkce_code_verifier", verifier);
    sessionStorage.setItem("oauth_state", state);
  },
  getPKCEContext: () => ({
    verifier: sessionStorage.getItem("pkce_code_verifier"),
    state: sessionStorage.getItem("oauth_state"),
  }),
  clearPKCEContext: () => {
    sessionStorage.removeItem("pkce_code_verifier");
    sessionStorage.removeItem("oauth_state");
  },
};

