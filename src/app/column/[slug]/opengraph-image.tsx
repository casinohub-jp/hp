import { ImageResponse } from "next/og";
import { getArticle, getAllSlugs } from "@/lib/media";

export const alt = "Casinohub コラム記事";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  const title = article?.title ?? "Casinohub コラム";
  const category = article?.category ?? "";
  const date = article?.date ?? "";

  const fontData = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap"
  )
    .then((res) => res.text())
    .then((css) => {
      const match = css.match(/src:\s*url\(([^)]+)\)/);
      return match ? fetch(match[1]).then((r) => r.arrayBuffer()) : null;
    });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #1a0533 0%, #0c1a3a 100%)",
          position: "relative",
          padding: "60px",
        }}
      >
        {/* 装飾グロー */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-40px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(217,70,239,0.25), transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-40px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.2), transparent 60%)",
          }}
        />

        {/* 左上にサービス名 */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.5)",
            display: "flex",
          }}
        >
          Casinohub
        </div>

        {/* 記事タイトル（中央配置） */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: title.length > 30 ? "40px" : "48px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.4,
              textAlign: "center",
              maxWidth: "1000px",
              display: "flex",
            }}
          >
            {title}
          </div>
        </div>

        {/* 下部: カテゴリと日付 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {category ? (
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#d946ef",
                display: "flex",
              }}
            >
              {category}
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
          {date ? (
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                display: "flex",
              }}
            >
              {date}
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "NotoSansJP",
              data: fontData,
              style: "normal" as const,
              weight: 700 as const,
            },
          ]
        : [],
    }
  );
}
