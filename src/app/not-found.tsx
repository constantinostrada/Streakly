/**
 * Custom 404 page
 */

import Link from "next/link";

export default function NotFound(): React.JSX.Element {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1rem",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "4rem", fontWeight: 700, color: "var(--color-primary)" }}>404</h1>
      <p style={{ fontSize: "1.25rem", color: "var(--color-muted)" }}>
        That page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          background: "var(--color-primary)",
          color: "#fff",
          padding: "0.6rem 1.5rem",
          borderRadius: "var(--radius)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        ← Back to Habits
      </Link>
    </main>
  );
}
