"use client";

import { useEffect, useRef } from "react";

interface LottieLoaderProps {
  size?: number;
  className?: string;
}

export default function LottieLoaderClient({
  size = 80,
  className = "",
}: LottieLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("lottie-web").then((lottie) => {
        if (containerRef.current && !animationRef.current) {
          animationRef.current = lottie.default.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "/loading.json",
          });
        }
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size }}
      aria-label="로딩 중"
    />
  );
}
