import { useEffect } from "react";
import { Outlet, useLocation, useMatch } from "react-router-dom";
import Cursor from "./components/chrome/Cursor";
import SiteMenu, { type PageId } from "./components/chrome/SiteMenu";
import SiteFooter from "./components/chrome/SiteFooter";

/** Route → (body class, active menu id). Mirrors the old per-page `page-<name>`. */
function pageInfo(pathname: string, slug?: string): { bodyClass: string; current?: PageId } {
  if (pathname === "/") return { bodyClass: "page-home", current: "work" };
  if (pathname.startsWith("/about")) return { bodyClass: "page-about", current: "about" };
  if (pathname.startsWith("/play")) return { bodyClass: "page-play", current: "play" };
  if (pathname.startsWith("/projects/"))
    return { bodyClass: `page-project work-${slug ?? ""}`.trim(), current: "work" };
  return { bodyClass: "" };
}

export default function App() {
  const location = useLocation();
  const projectMatch = useMatch("/projects/:slug");
  const { bodyClass, current } = pageInfo(location.pathname, projectMatch?.params.slug);

  useEffect(() => {
    document.body.className = bodyClass;
    return () => {
      document.body.className = "";
    };
  }, [bodyClass]);

  return (
    <>
      <Cursor />
      <div className="shell">
        <SiteMenu current={current} />
        <Outlet />
        <SiteFooter />
      </div>
    </>
  );
}
