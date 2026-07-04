import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "yoin <noreply@yoin.jp>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${BASE_URL}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "【yoin】メールアドレスの確認",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#0d9488;margin-bottom:8px">yoin へようこそ</h2>
        <p style="color:#374151;line-height:1.6">
          以下のボタンをクリックしてメールアドレスを確認してください。<br>
          リンクの有効期限は24時間です。
        </p>
        <a href="${url}"
           style="display:inline-block;margin:24px 0;background:#0d9488;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600">
          メールアドレスを確認する
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          このメールに心当たりがない場合は無視してください。<br>
          ボタンが動作しない場合: ${url}
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${BASE_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "【yoin】パスワードのリセット",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#0d9488;margin-bottom:8px">パスワードリセット</h2>
        <p style="color:#374151;line-height:1.6">
          以下のボタンからパスワードを再設定してください。<br>
          リンクの有効期限は1時間です。
        </p>
        <a href="${url}"
           style="display:inline-block;margin:24px 0;background:#0d9488;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600">
          パスワードを再設定する
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">
          このメールに心当たりがない場合は無視してください。
        </p>
      </div>
    `,
  });
}
