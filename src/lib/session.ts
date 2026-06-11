import type { SessionOptions } from "iron-session";

export interface SessionData {
  loggedIn?: boolean;
  visited?: boolean;
}

const secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 32) {
  throw new Error(
    "SESSION_SECRET doit être définie dans .env (32 caractères minimum)"
  );
}

export const sessionOptions: SessionOptions = {
  password: secret,
  cookieName: "jssalles_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
  },
};
