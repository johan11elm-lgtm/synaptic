"use client";

import {
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type LinkPreviewProps = {
  children: ReactNode;
  url: string;
  imageAlt?: string;
  width?: number;
  height?: number;
};

const OPEN_DELAY = 75;
const CLOSE_DELAY = 150;
const CURSOR_OFFSET_Y = 20;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function buildMicrolinkSrc(url: string, width: number, height: number) {
  const params = new URLSearchParams({
    url,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    colorScheme: "dark",
    "viewport.isMobile": "true",
    "viewport.deviceScaleFactor": "1",
    "viewport.width": String(width * 2.5),
    "viewport.height": String(height * 2.5),
  });
  return `https://api.microlink.io/?${params.toString()}`;
}

export function LinkPreview({
  children,
  url,
  imageAlt = "",
  width = 360,
  height = 225,
}: LinkPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const openTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (openTimeoutRef.current !== null) {
        window.clearTimeout(openTimeoutRef.current);
      }
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const clearTimers = useCallback(() => {
    if (openTimeoutRef.current !== null) {
      window.clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const updatePointerPos = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setPointerPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const handlePointerEnter = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return;
      updatePointerPos(e);
      clearTimers();
      openTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(true);
      }, OPEN_DELAY);
    },
    [clearTimers, updatePointerPos],
  );

  const handlePointerLeave = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return;
      clearTimers();
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
      }, CLOSE_DELAY);
    },
    [clearTimers],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return;
      updatePointerPos(e);
    },
    [updatePointerPos],
  );

  const previewSrc = useMemo(
    () => buildMicrolinkSrc(url, width, height),
    [url, width, height],
  );

  const cardTransform = isOpen
    ? `translateX(-50%) translateY(calc(-100% - ${CURSOR_OFFSET_Y}px)) scale(1)`
    : `translateX(-50%) translateY(calc(-100% - ${CURSOR_OFFSET_Y - 6}px)) scale(0.96)`;

  const cardTransition = reducedMotion
    ? "opacity 200ms ease-out"
    : "opacity 200ms ease-out, transform 200ms ease-out";

  return (
    <div
      className="relative"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {children}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-50"
        style={{
          transform: `translate3d(${pointerPos.x}px, ${pointerPos.y}px, 0)`,
        }}
      >
        <div
          style={{
            opacity: isOpen ? 1 : 0,
            transform: cardTransform,
            transition: cardTransition,
          }}
        >
          <div className="overflow-hidden rounded-lg border border-foreground/10 bg-background/80 shadow-2xl shadow-foreground/20 backdrop-blur-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt={imageAlt}
              width={width}
              height={height}
              loading="lazy"
              className="block bg-foreground/5"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
