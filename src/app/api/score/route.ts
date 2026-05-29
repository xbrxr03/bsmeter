import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { bsScore } from "../../../core/index";
import type { BSMeterOptions } from "../../../core/types";

const rateLimit = new Map<string, { count: number; reset: number }>();
const LIMIT = 20;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, domain, context } = body as {
    text?: string;
    domain?: string;
    context?: BSMeterOptions["context"];
  };

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (text.length > 50_000) {
    return NextResponse.json({ error: "text too long (max 50,000 chars)" }, { status: 400 });
  }

  const validDomains = ["code-review", "content-seo", "social-news"];
  const resolvedDomain = validDomains.includes(domain ?? "") ? domain : "content-seo";

  const options: BSMeterOptions = {
    domain: resolvedDomain as BSMeterOptions["domain"],
    context,
  };

  const result = bsScore(text, options);
  return NextResponse.json(result);
}
