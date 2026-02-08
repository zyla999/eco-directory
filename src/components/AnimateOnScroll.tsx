"use client";

import { useEffect, useRef, ReactNode } from "react";

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: "fade-in-up" | "fade-in" | "slide-in-left" | "slide-in-right" | "scale-in";
  stagger?: number;
  className?: string;
}

export default function AnimateOnScroll({
  children,
  animation = "fade-in-up",
  stagger,
  className = "",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const staggerClass = stagger ? `stagger-${stagger}` : "";

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${staggerClass} ${className}`}
      data-animation={animation}
    >
      {children}
    </div>
  );
}
