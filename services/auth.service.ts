import type { User } from "@/types";
import {
  api,
  clearAccessToken,
  getAccessToken,
  normalizeId,
  setAccessToken,
  unwrapEntity,
} from "./api";

type AuthResponse = {
  token?: string;
  accessToken?: string;
  user?: User;
  verificationRequired?: boolean;
  delivered?: boolean;
  developmentCode?: string;
};

const paths = {
  login:
    process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH || "/api/v1/auth/login",
  register:
    process.env.NEXT_PUBLIC_AUTH_REGISTER_PATH ||
    "/api/v1/users/create-user",
  me: process.env.NEXT_PUBLIC_AUTH_ME_PATH || "/api/v1/users/me",
  verify:
    process.env.NEXT_PUBLIC_AUTH_VERIFY_PATH ||
    "/api/v1/auth/verify-email",
  resend:
    process.env.NEXT_PUBLIC_AUTH_RESEND_PATH ||
    "/api/v1/auth/resend-verification",
  updateProfile:
    process.env.NEXT_PUBLIC_AUTH_PROFILE_PATH ||
    "/api/v1/users/update-user",
  changePassword:
    process.env.NEXT_PUBLIC_AUTH_CHANGE_PASSWORD_PATH ||
    "/api/v1/auth/change-password",
};

export const authService = {
  async login(input: { email: string; password: string }) {
    const { data } = await api.post(paths.login, input);
    const result = unwrapEntity<AuthResponse>(data, ["result", "auth"]);
    const token = result.accessToken || result.token;
    if (!token) throw new Error("The server did not return an access token.");
    setAccessToken(token);
    return result;
  },

  async register(input: { name: string; email: string; password: string }) {
    const { data } = await api.post(paths.register, input);
    const result = unwrapEntity<AuthResponse>(data, ["result", "auth"]);
    const token = result.accessToken || result.token;
    if (token) {
      setAccessToken(token);
    }
    return result;
  },

  async me() {
    const { data } = await api.get(paths.me);
    return normalizeId(unwrapEntity<User>(data, ["result", "user"]));
  },

  async verifyEmail(input: { email: string; code: string }) {
    const { data } = await api.post(paths.verify, input);
    return unwrapEntity<unknown>(data, ["result"]);
  },

  async resendVerification(email: string) {
    const { data } = await api.post(paths.resend, { email });
    return unwrapEntity<AuthResponse>(data, ["result"]);
  },

  async updateProfile(body: FormData) {
    const { data } = await api.patch(paths.updateProfile, body);
    return normalizeId(
      unwrapEntity<User>(data, ["user", "result", "item"]),
    );
  },

  async changePassword(input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    await api.patch(paths.changePassword, input);
    clearAccessToken();
  },

  logout() {
    clearAccessToken();
  },

  hasToken() {
    return Boolean(getAccessToken());
  },
};
