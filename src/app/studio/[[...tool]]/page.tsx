import { cmsEnabled } from "../../../../sanity/env";
import { StudioClient } from "./StudioClient";

export const dynamic = "force-static";

/**
 * The editor lives at /studio. Until a Sanity project is configured it shows
 * setup instructions instead of crashing on an empty project id.
 */
export default function StudioPage() {
  if (!cmsEnabled) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0a1017",
          color: "#e8edf2",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "34rem" }}>
          <p
            style={{
              color: "#f5c518",
              letterSpacing: "0.2em",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Redaktion
          </p>
          <h1 style={{ fontSize: "1.9rem", margin: "0.75rem 0 0" }}>
            Noch nicht verbunden
          </h1>
          <p style={{ color: "rgba(232,237,242,0.6)", lineHeight: 1.7, marginTop: "1rem" }}>
            Für den Redaktionszugang fehlt die Projekt-Kennung. Legen Sie unter{" "}
            <code style={{ color: "#f5c518" }}>sanity.io</code> ein kostenloses Projekt an und
            tragen Sie in der Datei <code style={{ color: "#f5c518" }}>.env.local</code> ein:
          </p>
          <pre
            style={{
              background: "#111a24",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "1rem",
              marginTop: "1rem",
              overflowX: "auto",
              fontSize: "0.85rem",
              lineHeight: 1.8,
            }}
          >
            {`NEXT_PUBLIC_SANITY_PROJECT_ID=<Projekt-ID>
NEXT_PUBLIC_SANITY_DATASET=production`}
          </pre>
          <p style={{ color: "rgba(232,237,242,0.45)", fontSize: "0.85rem", marginTop: "1rem" }}>
            Die Website läuft auch ohne diesen Schritt — sie zeigt dann die fest hinterlegten
            Inhalte.
          </p>
        </div>
      </main>
    );
  }

  return <StudioClient />;
}
