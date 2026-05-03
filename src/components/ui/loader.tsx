"use client";
import React from "react";

export function LoaderOne({
  size = "md",
  className,
  style,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}) {
  const cfg = {
    sm: { w: 2, h: 12, gap: 2 },
    md: { w: 3, h: 20, gap: 3 },
    lg: { w: 4, h: 28, gap: 4 },
  }[size];

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: cfg.gap, ...style }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: cfg.w,
            height: cfg.h,
            borderRadius: 9999,
            background: "currentColor",
            animation: "loaderOneBar 0.8s ease-in-out infinite",
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </span>
  );
}
