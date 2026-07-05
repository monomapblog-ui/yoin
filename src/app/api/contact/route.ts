import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@yoin.jp";

export async function POST(req: NextRequest) {
  const { name, email, subject, body } = await req.json();

  if (!name || !email || !subject || !body) {
    return NextResponse.json({ error: "入力内容が不完全です" }, { status: 400 });
  }

  if (body.length > 2000) {
    return NextResponse.json({ error: "本文が長すぎます" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: `yoin お問い合わせ <${SUPPORT_EMAIL}>`,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `【お問い合わせ】${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
          <h2 style="color:#0d9488;margin-bottom:16px">お問い合わせを受信しました</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#6b7280;width:120px">お名前</td><td style="padding:8px 0">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">メール</td><td style="padding:8px 0">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">件名</td><td style="padding:8px 0">${escapeHtml(subject)}</td></tr>
          </table>
          <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb" />
          <p style="white-space:pre-wrap;color:#374151;line-height:1.7">${escapeHtml(body)}</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "送信に失敗しました。しばらく後でお試しください。" }, { status: 500 });
  }
}

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
