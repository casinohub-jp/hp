import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "Casinohubへのお問い合わせはこちらから。導入のご相談、機能に関するご質問など、お気軽にご連絡ください。",
};

export default function ContactPage() {
  return (
    <section className="py-20 px-4 bg-ch-bg min-h-[80vh]">
      <div className="mx-auto max-w-lg">
        <div className="text-center mb-10">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-ch-primary/10 flex items-center justify-center mb-4">
            <Mail size={24} className="text-ch-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-ch-text">
            お問い合わせ
          </h1>
          <p className="mt-3 text-sm text-ch-text-secondary">
            導入のご相談、機能に関するご質問など、お気軽にどうぞ。
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
