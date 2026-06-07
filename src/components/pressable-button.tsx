"use client";

import { useState, type ButtonHTMLAttributes } from "react";

export const PRESS_FEEDBACK_CLASS =
  "touch-manipulation transition-[transform,opacity,filter,border-color] duration-150 ease-out [-webkit-tap-highlight-color:transparent] motion-reduce:transition-none active:scale-[0.98] active:brightness-95";

function PressOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span
      className="pointer-events-none absolute inset-0 z-10 bg-white/10 motion-reduce:hidden"
      aria-hidden
    />
  );
}

type PressableButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PressableButton({
  className = "",
  children,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  ...props
}: PressableButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const pressedClass = isPressed
    ? "scale-[0.98] border-amber-500/40 brightness-95 opacity-90"
    : "";

  return (
    <button
      {...props}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        setIsPressed(true);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        window.setTimeout(() => setIsPressed(false), 180);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setIsPressed(false);
      }}
      className={`relative ${PRESS_FEEDBACK_CLASS} ${className} ${pressedClass}`}
    >
      <PressOverlay visible={isPressed} />
      {children}
    </button>
  );
}
