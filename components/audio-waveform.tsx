"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

type AudioWaveformProps = {
  isPlaying: boolean;
  color?: string;
  height?: number;
  width?: number;
  barCount?: number;
};

export function AudioWaveform({
  isPlaying,
  color = "#ff0000",
  height = 40,
  width = 100,
  barCount = 5,
}: AudioWaveformProps) {
  const [bars, setBars] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setBars(Array.from({ length: barCount }, () => Math.random() * 0.8 + 0.2));

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setBars((prev) => prev.map(() => Math.random() * 0.8 + 0.2));
      }, 200);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, barCount]);

  return (
    <div
      className="flex items-end justify-center gap-1"
      style={{ height, width }}
      aria-hidden="true"
    >
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ height: "20%" }}
          animate={{ height: isPlaying ? `${height * 100}%` : "20%" }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  );
}
