/**
 * Update Open Graph and Twitter meta tags dynamically.
 * Use this inside useEffect after page/data loads.
 */
export function updateMetaTags({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  document.title = title;

  const setMeta = (property: string, content: string) => {
    let el = document.querySelector(
      `meta[property="${property}"]`
    ) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("property", property);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  const setName = (name: string, content: string) => {
    let el = document.querySelector(
      `meta[name="${name}"]`
    ) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  setMeta("og:title", title);
  setMeta("og:description", description);
  setMeta("og:image", image);
  setMeta("og:url", url);
  setMeta("og:type", "article");

  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", image);
  setMeta("twitter:card", "summary_large_image");

  setName("description", description);
}

/**
 * Reset meta tags back to site defaults.
 */
export function resetMetaTags() {
  document.title = "Aesthetic Pondok Indah Dental Clinic";

  const setMeta = (property: string, content: string) => {
    const el = document.querySelector(
      `meta[property="${property}"]`
    ) as HTMLMetaElement | null;
    if (el) el.setAttribute("content", content);
  };

  const setName = (name: string, content: string) => {
    const el = document.querySelector(
      `meta[name="${name}"]`
    ) as HTMLMetaElement | null;
    if (el) el.setAttribute("content", content);
  };

  const defaultDesc = "The solution to brighten your smile";
  const defaultImage = typeof window !== "undefined" ? `${window.location.origin}/logo/logo.png` : "https://aestheticpondokindah.com/logo/logo.png";
  const defaultUrl = typeof window !== "undefined" ? window.location.origin : "https://aestheticpondokindah.com/";

  setMeta("og:title", "Aesthetic Pondok Indah Dental Clinic");
  setMeta("og:description", defaultDesc);
  setMeta("og:image", defaultImage);
  setMeta("og:url", defaultUrl);
  setMeta("og:type", "website");

  setMeta("twitter:title", "Aesthetic Pondok Indah Dental Clinic");
  setMeta("twitter:description", defaultDesc);
  setMeta("twitter:image", defaultImage);
  setMeta("twitter:card", "summary_large_image");

  setName("description", defaultDesc);
}
