"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ClientScripts() {
  const router = useRouter();
  const pathname = usePathname();
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    document.documentElement.classList.remove("page-exit");
  }, [pathname]);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      typeof navigator !== "undefined" &&
      "connection" in navigator &&
      Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    const shouldUseTransitions = !reduceMotion && !saveData;

    // only enable custom cursor on devices with fine pointer (mouse)
    if (typeof window !== "undefined") {
      const canUseCursor = window.matchMedia && window.matchMedia("(pointer: fine) and (hover: hover)").matches;
      if (!canUseCursor || !shouldUseTransitions) return;
    }

    let idleCallbackId: number | null = null;
    let idleTimeoutId: ReturnType<typeof setTimeout> | null = null;

    function setupCursor() {
      // create follower cursor and small dot at pointer
      const follower = document.createElement("div");
      follower.className = "site-cursor";
      document.body.appendChild(follower);
      cursorRef.current = follower;

      const dot = document.createElement("div");
      dot.className = "site-cursor-dot";
      document.body.appendChild(dot);
      dotRef.current = dot;

      function update() {
        const cur = cursorRef.current;
        const d = dotRef.current;
        if (!cur || !d) return;
        // faster easing for a more responsive follower cursor
        posRef.current.tx += (posRef.current.x - posRef.current.tx) * 0.45;
        posRef.current.ty += (posRef.current.y - posRef.current.ty) * 0.45;
        // position the follower with smoothing
        cur.style.transform = `translate(${posRef.current.tx}px, ${posRef.current.ty}px) translate(-50%, -50%) scale(1)`;
        // dot is moved directly in onMove for immediate response
        rafRef.current = requestAnimationFrame(update);
      }
      rafRef.current = requestAnimationFrame(update);
    }

    function onMove(e: PointerEvent) {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      // move dot directly for immediate feedback
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        dotRef.current.style.opacity = "1";
      }
      if (cursorRef.current) cursorRef.current.style.opacity = "1";
    }

    function onEnterLink() {
      cursorRef.current?.classList.add("cursor--hover");
      dotRef.current?.classList.add("cursor--hover");
    }
    function onLeaveLink() {
      cursorRef.current?.classList.remove("cursor--hover");
      dotRef.current?.classList.remove("cursor--hover");
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");
      if (!href) return;
      // ignore external links and anchors with modifiers
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("#") ||
        targetAttr === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;

      // internal link: animate out then navigate
      e.preventDefault();
      if (shouldUseTransitions) {
        document.documentElement.classList.add("page-exit");
      }
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          router.push(href);
        });
      });
    }

    function onOver(e: Event) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest("a,button,[role='button']") as HTMLElement | null;
      if (interactive) onEnterLink();
    }
    function onOut(e: Event) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest("a,button,[role='button']") as HTMLElement | null;
      if (interactive) onLeaveLink();
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(setupCursor, { timeout: 400 });
    } else {
      idleTimeoutId = setTimeout(setupCursor, 1);
    }

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });

    return () => {
      if (idleCallbackId !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (idleTimeoutId !== null) {
        clearTimeout(idleTimeoutId);
      }
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("click", onClick);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      if (cursorRef.current) cursorRef.current.remove();
      if (dotRef.current) dotRef.current.remove();
    };
  }, []);

  return null;
}
