import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.loggedIn) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "URL requise" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const text = await response.text();
    const isValid = /BEGIN:VEVENT/.test(text);
    return NextResponse.json({
      status: isValid ? "accessible" : "contenu invalide",
    });
  } catch {
    return NextResponse.json({ status: "inaccessible" });
  }
}
