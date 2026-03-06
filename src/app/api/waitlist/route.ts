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
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "メールアドレスは必須です" },
        { status: 400 },
      );
    }

    const { data, error: sendError } = await resend.emails.send({
      from: "Casinohub <noreply@casinohub.jp>",
      replyTo: "contact@casinohub.jp",
      to: [email],
      cc: ["contact@casinohub.jp"],
      subject: "【Casinohub】事前登録ありがとうございます",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1a0533, #0c1a3a); padding: 24px; text-align: center;">
            <h1 style="background: linear-gradient(to right, #d946ef, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; font-size: 24px; font-weight: 900;">Casinohub</h1>
          </div>
          <div style="padding: 30px;">
            <p>事前登録いただきありがとうございます。</p>
            <p>Casinohubは、アミューズメントカジノ向けのトーナメント管理SaaSです。<br>βテストの準備が整い次第、このメールアドレスにご案内をお送りします。</p>
            <div style="margin: 24px 0; padding: 16px; background: #faf8ff; border-radius: 8px; border-left: 4px solid #d946ef;">
              <p style="margin: 0; font-size: 14px; color: #6b5f8a;">「うちの店ではこう管理してる」「こんな機能がほしい」など、何でもお気軽にご連絡ください。開発の方向性に直接反映します。</p>
            </div>
            <p style="color: #9b93b8; font-size: 13px;">※ このメールは自動送信です。ご返信は contact@casinohub.jp までお願いいたします。</p>
          </div>
          <div style="padding: 15px; text-align: center; color: #9b93b8; font-size: 12px; border-top: 1px solid #e2ddf0;">
            &copy; Casinohub — アミューズメントカジノ向けトーナメント管理SaaS
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
        type: "waitlist",
        name: null,
        email,
        company: null,
        phone: null,
        message: null,
        metadata: {},
      });
    } catch {
      console.error("inquiries insert失敗（メール送信は成功）");
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("事前登録メール送信エラー:", error);
    const message =
      error instanceof Error ? error.message : "送信に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
