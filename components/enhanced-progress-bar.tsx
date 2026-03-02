"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  easing: "ease",
  speed: 500,
  template:
    '<div class="bar" role="bar" style="background-color: #3d6c58;"></div>',
});

export function EnhancedProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let rafId: number;

    const startProgress = () => {
      NProgress.start();
    };

    const completeProgress = () => {
      rafId = requestAnimationFrame(() => {
        timeoutId = setTimeout(() => {
          NProgress.done();
        }, 300);
      });
    };

    // Start progress immediately when route changes
    startProgress();

    // Listen for DOM content to be loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", completeProgress, {
        once: true,
      });
    } else {
      // If already loaded, complete after a short delay
      completeProgress();
    }

    return () => {
      document.removeEventListener("DOMContentLoaded", completeProgress);
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
}
