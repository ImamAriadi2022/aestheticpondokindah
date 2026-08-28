import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Universal helper to reset scroll position across the window, body, document,
 * and any scrollable container element (such as dashboard main or overflow-y-auto views).
 */
export function scrollPageToTop(smooth = false) {
  if (typeof window === "undefined") return;

  const behavior: ScrollBehavior = smooth ? "smooth" : "instant";

  // 1. Reset standard window & document scroll
  window.scrollTo({ top: 0, left: 0, behavior });
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
  }
  if (document.body) {
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
  }

  // 2. Reset any nested scrollable containers in SPAs/Dashboards
  try {
    const scrollContainers = document.querySelectorAll(
      "main, .overflow-y-auto, .mobile-dashboard-main, .mobile-dashboard-content, #root > div"
    );
    scrollContainers.forEach((el) => {
      if (el && "scrollTop" in el) {
        if (smooth && "scrollTo" in el) {
          (el as HTMLElement).scrollTo({ top: 0, left: 0, behavior: "smooth" });
        } else {
          el.scrollTop = 0;
          el.scrollLeft = 0;
        }
      }
    });
  } catch {
    // Non-blocking
  }
}

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Run immediately on path, search parameter, or navigation key change
    scrollPageToTop(false);

    // Microtask fallback to catch any async render adjustments
    const timeoutId = window.setTimeout(() => {
      scrollPageToTop(false);
    }, 20);

    return () => window.clearTimeout(timeoutId);
  }, [location.pathname, location.search, location.key]);

  return null;
}

