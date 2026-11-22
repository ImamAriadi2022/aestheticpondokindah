import DOMPurify from "dompurify";

/**
 * Sanitize untrusted/CMS HTML before passing into dangerouslySetInnerHTML
 * to prevent Stored XSS while preserving safe formatting tags.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return "";
  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
}
