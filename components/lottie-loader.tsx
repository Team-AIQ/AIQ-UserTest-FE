"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const LottieLoader = dynamic(() => import("./LottieLoaderClient"), {
  ssr: false,
});

interface LottieLoaderProps {
  size?: number;
  className?: string;
}

export { LottieLoader };
