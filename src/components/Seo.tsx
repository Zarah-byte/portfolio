import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

const SITE = "https://zarahyaqub.com";

function setMeta(selector: string, attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  el.setAttribute("content", value);
}

/**
 * Hand-rolled per-route head setter (title/description/canonical/OG). Ported
 * from the per-page <head> meta of the static site. A helper, not react-helmet
 * — the fields are few and stable.
 */
export default function Seo({ title, description, canonical, ogImage, ogType = "website" }: SeoProps) {
  useEffect(() => {
    document.title = title;
    if (description) {
      setMeta('meta[name="description"]', "name", "description", description);
      setMeta('meta[property="og:description"]', "property", "og:description", description);
    }
    setMeta('meta[property="og:title"]', "property", "og:title", title);
    setMeta('meta[property="og:type"]', "property", "og:type", ogType);
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "Zarah Yaqub");
    if (canonical) {
      const url = canonical.startsWith("http") ? canonical : `${SITE}${canonical}`;
      setMeta('meta[property="og:url"]', "property", "og:url", url);
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.append(link);
      }
      link.href = url;
    }
    if (ogImage) {
      const img = ogImage.startsWith("http") ? ogImage : `${SITE}${ogImage}`;
      setMeta('meta[property="og:image"]', "property", "og:image", img);
      setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    }
  }, [title, description, canonical, ogImage, ogType]);

  return null;
}
