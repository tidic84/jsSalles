import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  loggedIn?: boolean;
  visited?: boolean;
}

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long_fallback",
  cookieName: "jssalles_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
