"use client";

import Lottie from "lottie-react";
import animationData from "@/public/loading.json";

interface Props {
  size?: number;
}

export default function LottieLoaderClient({ size = 160 }: Props) {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      className="block"
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
