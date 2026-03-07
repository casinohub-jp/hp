import { ImageResponse } from "next/og";

export const alt = "Casinohub | アミューズメントカジノ向けトーナメント管理SaaS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a0533 0%, #0c1a3a 100%)",
          position: "relative",
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

        {/* サービス名 */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          Casinohub
        </div>

        {/* キャッチコピー */}
        <div
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.6)",
            marginTop: "20px",
            display: "flex",
          }}
        >
          トーナメント運営を、もっとスマートに。
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
