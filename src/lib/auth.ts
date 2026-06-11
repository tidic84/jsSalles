import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "./session";

export type { SessionData };

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
