"use client";

import { Pointer } from "@/components/magicui/pointer";
import { useEffect, useState } from "react";

export default function ColoredPointer() {
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPointerPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Pointer
      className="fixed pointer-events-none z-50 fill-blue-500"
      style={{
        top: pointerPosition.y,
        left: pointerPosition.x,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}
