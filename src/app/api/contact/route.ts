import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY が設定されていません");
  return new Resend(key);
}

export async function POST(request: NextRequest) {
  try {
    const resend = getResend();
    const { name, email, storeName, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "メールアドレスとお問い合わせ内容は必須です" },
        { status: 400 },
      );
    }

    const { data, error: sendError } = await resend.emails.send({
      from: "Casinohub <noreply@casinohub.jp>",
      replyTo: email,
      to: ["contact@casinohub.jp"],
      subject: `【Casinohub】お問い合わせ: ${name || "名前未入力"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a0533, #0c1a3a); padding: 24px; text-align: center;">
            <h1 style="background: linear-gradient(to right, #d946ef, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; font-size: 24px; font-weight: 900;">Casinohub</h1>
            <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">お問い合わせ</p>
          </div>
          <div style="padding: 30px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 8px 0; color: #9b93b8; font-size: 13px; width: 100px;">お名前</td><td style="padding: 8px 0;">${name || "—"}</td></tr>
              <tr><td style="padding: 8px 0; color: #9b93b8; font-size: 13px;">メール</td><td style="padding: 8px 0;">${email}</td></tr>
              <tr><td style="padding: 8px 0; color: #9b93b8; font-size: 13px;">店舗名</td><td style="padding: 8px 0;">${storeName || "—"}</td></tr>
            </table>
            <div style="padding: 16px; background: #faf8ff; border-radius: 8px; border-left: 4px solid #d946ef;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #9b93b8;">お問い合わせ内容</p>
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        </div>
      `,
    });

    if (sendError) {
      console.error("Resendエラー:", sendError);
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    // inquiries保存（失敗してもメール送信の成功は返す）
    try {
      const supabase = createClient(
        process.env.INQUIRY_SUPABASE_URL!,
        process.env.INQUIRY_SUPABASE_ANON_KEY!,
      );
      await supabase.from("inquiries").insert({
        project: "casinohub",
        type: "contact",
        name: name || null,
        email,
        company: null,
        phone: null,
        message,
        metadata: { storeName: storeName || null },
      });
    } catch {
      console.error("inquiries insert失敗（メール送信は成功）");
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("お問い合わせメール送信エラー:", error);
    const message =
      error instanceof Error ? error.message : "送信に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
