import { axiosClient } from "@/helper/axiosClient";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  oauthStorage,
} from "@/helper/oauthPKCE";
import type { IUser } from "@/types/user";

const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID || "classbuddy-web";
const REDIRECT_URI =
  import.meta.env.VITE_OAUTH_REDIRECT_URI || "http://localhost:5173/oauth/callback";

export interface ITokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export const oauthService = {
  /**
   * Generates PKCE challenge and state, authenticates user credentials with custom OAuth server,
   * and returns authorization code redirect URL.
   */
  loginWithOAuth: async (email: string, password: string) => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();

    // Save temporary PKCE session transaction
    oauthStorage.savePKCEContext(verifier, state);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("client_id", CLIENT_ID);
    formData.append("redirect_uri", REDIRECT_URI);
    formData.append("code_challenge", challenge);
    formData.append("code_challenge_method", "S256");
    formData.append("scope", "openid profile email");
    formData.append("state", state);

    const response = await axiosClient.post("/oauth/authorize/login", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data as { redirect_url: string; code: string; state: string };
  },

  /**
   * Validates state, exchanges authorization code and PKCE code_verifier for tokens (set as HttpOnly cookies),
   * and retrieves the current user profile.
   */
  exchangeAuthorizationCode: async (code: string, returnedState: string) => {
    const { verifier, state: storedState } = oauthStorage.getPKCEContext();

    if (!returnedState || returnedState !== storedState) {
      oauthStorage.clearPKCEContext();
      throw new Error("OAuth state mismatch! Security verification failed.");
    }

    if (!verifier) {
      oauthStorage.clearPKCEContext();
      throw new Error("Missing PKCE code_verifier.");
    }

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("client_id", CLIENT_ID);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("code_verifier", verifier);

    // Endpoint sets HttpOnly Secure cookies automatically
    await axiosClient.post("/oauth/token", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    oauthStorage.clearPKCEContext();

    // Fetch user profile using cookie-authenticated session
    const userResponse = await axiosClient.get<IUser>("/oauth/userinfo");
    return userResponse.data;
  },

  /**
   * Revokes the current session and clears client PKCE storage.
   */
  logoutOAuth: async () => {
    try {
      const params = new URLSearchParams();
      params.append("client_id", CLIENT_ID);

      await axiosClient.post("/oauth/revoke", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
    } catch (error) {
      console.warn("Failed to revoke session on server:", error);
    } finally {
      oauthStorage.clearPKCEContext();
    }
  },

  /**
   * Fetches current authenticated user profile via HttpOnly cookie.
   */
  getCurrentUser: async (): Promise<IUser> => {
    const response = await axiosClient.get<IUser>("/oauth/userinfo");
    return response.data;
  },
};

