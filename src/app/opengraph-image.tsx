import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "English Tutor AI - Parlez anglais avec un avatar 3D";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #faf2e8 0%, #f5e4d0 50%, #fdf1ed 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Cercle décoratif fond */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(196, 81, 46, 0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(196, 81, 46, 0.06)",
          }}
        />

        {/* Contenu principal */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 24,
            padding: "0 80px",
          }}
        >
          {/* Logo / badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "rgba(196, 81, 46, 0.1)",
              border: "2px solid rgba(196, 81, 46, 0.3)",
              borderRadius: 100,
              padding: "12px 28px",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg, #c4512e, #a83d20)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 24,
              }}
            >
              🎙
            </div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#c4512e",
                letterSpacing: "-0.02em",
              }}
            >
              English Tutor AI
            </span>
          </div>

          {/* Titre */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#2a1a0f",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Parlez anglais avec
            <br />
            <span style={{ color: "#c4512e" }}>un tuteur IA</span>
          </h1>

          {/* Sous-titre */}
          <p
            style={{
              fontSize: 26,
              color: "#7d5a3c",
              margin: 0,
              lineHeight: 1.4,
              maxWidth: 700,
            }}
          >
            Avatar 3D · Corrections en temps réel · Flashcards intelligentes
          </p>

          {/* CTA */}
          <div
            style={{
              background: "#c4512e",
              color: "white",
              borderRadius: 100,
              padding: "18px 40px",
              fontSize: 22,
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            Commencer gratuitement →
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
