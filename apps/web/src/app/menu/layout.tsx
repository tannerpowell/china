import "../styles/menu3-fonts.css";
import "../styles/menu3.css";

// Menu-only styles live here (not the root layout) so /, /location,
// /launch, and /studio don't download them. They still ship as a static
// <link> for /menu first paint.
export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
