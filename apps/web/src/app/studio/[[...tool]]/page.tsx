import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

// The public menu works without Sanity (local-JSON fallback), so a missing
// project ID must not break the build or ship a broken Studio. Render an
// explicit unconfigured state instead of constructing NextStudio invalid.
const isConfigured = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export default function StudioPage() {
  if (!isConfigured) {
    return (
      <main style={{ padding: 48, fontFamily: "system-ui, sans-serif" }}>
        <h1>Studio is not configured</h1>
        <p>
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and{" "}
          <code>NEXT_PUBLIC_SANITY_DATASET</code>) and redeploy to enable the
          owner CMS. See docs/sanity-setup.md.
        </p>
      </main>
    );
  }
  return <NextStudio config={config} />;
}
