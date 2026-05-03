"use client";

import { useEffect, useRef, useState } from "react";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  style?: React.CSSProperties;
}

export const TextGenerateEffect = ({ words, className = "", style }: TextGenerateEffectProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentIndex < words.length) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < words.length) {
            setDisplayedText((current) => current + words[prev]);
            return prev + 1;
          }
          return prev;
        });
      }, 30);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, words]);

  return (
    <div className={`inline-block ${className}`} style={style}>
      <span className="text-white">{displayedText}</span>
      <span className="inline-block w-0.5 h-5 bg-white animate-pulse ml-1" />
    </div>
  );
};
