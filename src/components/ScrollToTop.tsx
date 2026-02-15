"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function ScrollToTop() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Skip if pathname hasn't actually changed (e.g. hash-only change)
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    // Skip if navigating to a hash anchor
    if (window.location.hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}
