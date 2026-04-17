import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const schema = z.object({
  subject: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(5).max(4000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { subject, email, message } = parsed.data;

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { error: insertError } = await supabase
    .from("support_messages")
    .insert({
      subject,
      email,
      message,
      user_id: userData.user?.id ?? null,
    });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 },
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.SUPPORT_EMAIL_TO;
  const from = process.env.SUPPORT_EMAIL_FROM;

  if (!resendKey || !to || !from) {
    console.warn("[support] Email skipped — missing env vars", {
      hasKey: !!resendKey,
      hasTo: !!to,
      hasFrom: !!from,
    });
    return NextResponse.json({ ok: true, emailed: false });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `[TicketIL Support] ${subject}`,
        text: `From: ${email}\nUser ID: ${userData.user?.id ?? "anon"}\n\n${message}`,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[support] Resend rejected:", res.status, body);
      return NextResponse.json({ ok: true, emailed: false });
    }
  } catch (err) {
    console.error("[support] Resend network error:", err);
    return NextResponse.json({ ok: true, emailed: false });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
