"use client";

import { useEffect, useRef, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export interface PillNavItem {
  label: string;
  href?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

interface PillNavProps {
  items: PillNavItem[];
  logoNode?: ReactNode;
  logoHref?: string;
  rightItems?: PillNavItem[];
  onHamburgerClick?: () => void;
  ease?: string;
}

export default function PillNav({
  items,
  logoNode,
  logoHref = "/",
  rightItems = [],
  onHamburgerClick,
  ease = "power2.out",
}: PillNavProps) {
  const pathname = usePathname();
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
  const tweenRefs = useRef<(gsap.core.Tween | null)[]>([]);

  const activeHref = [...items]
    .filter(
      (item) =>
        item.href &&
        !item.href.startsWith("/#") &&
        (item.href === pathname || pathname.startsWith(item.href + "/"))
    )
    .sort((a, b) => (b.href?.length ?? 0) - (a.href?.length ?? 0))[0]?.href;

  const layout = useCallback(() => {
    circleRefs.current.forEach((circle, i) => {
      if (!circle?.parentElement) return;
      const pill = circle.parentElement as HTMLElement;
      const { width: w, height: h } = pill.getBoundingClientRect();
      if (!w || !h) return;

      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${D - delta}px` });

      const label = pill.querySelector<HTMLElement>(".pn-label");
      const hover = pill.querySelector<HTMLElement>(".pn-label-hover");

      if (label) gsap.set(label, { y: 0 });
      if (hover) gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });

      tlRefs.current[i]?.kill();
      const tl = gsap.timeline({ paused: true });
      tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.6, ease, overwrite: "auto" }, 0);
      if (label) tl.to(label, { y: -(h + 8), duration: 0.6, ease, overwrite: "auto" }, 0);
      if (hover) tl.to(hover, { y: 0, opacity: 1, duration: 0.6, ease, overwrite: "auto" }, 0);
      tlRefs.current[i] = tl;
    });
  }, [ease]);

  useEffect(() => {
    layout();
    window.addEventListener("resize", layout);
    document.fonts?.ready?.then(layout).catch(() => {});
    return () => window.removeEventListener("resize", layout);
  }, [items, rightItems, ease, layout]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    tweenRefs.current[i]?.kill();
    tweenRefs.current[i] = tl.tweenTo(tl.duration(), { duration: 0.35, ease: "power2.out", overwrite: "auto" }) as gsap.core.Tween;
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    tweenRefs.current[i]?.kill();
    tweenRefs.current[i] = tl.tweenTo(0, { duration: 0.25, ease: "power2.out", overwrite: "auto" }) as gsap.core.Tween;
  };

  const pillContent = (item: PillNavItem, i: number) => (
    <>
      <span className="pn-circle" aria-hidden="true" ref={(el) => { circleRefs.current[i] = el; }} />
      <span className="pn-label-stack">
        <span className="pn-label">
          {item.prefix}{item.label}{item.suffix}
        </span>
        <span className="pn-label-hover" aria-hidden="true">
          {item.prefix}{item.label}{item.suffix}
        </span>
      </span>
    </>
  );

  const renderPill = (item: PillNavItem, i: number, isActive: boolean) => {
    const cls = `pn-pill${isActive ? " pn-active" : ""}`;
    const ev = { onMouseEnter: () => handleEnter(i), onMouseLeave: () => handleLeave(i) };
    if (item.onClick) {
      return (
        <button className={cls} aria-label={item.ariaLabel || item.label} onClick={item.onClick} style={{ minHeight: "44px" }} {...ev}>
          {pillContent(item, i)}
        </button>
      );
    }
    return (
      <Link href={item.href || "/"} className={cls} aria-label={item.ariaLabel || item.label} style={{ minHeight: "44px" }} {...ev}>
        {pillContent(item, i)}
      </Link>
    );
  };

  return (
    <div className="pn-bar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {logoNode && (
        <Link href={logoHref} className="pn-logo-link" style={{ transition: "none" }}>
          {logoNode}
        </Link>
      )}

      {items.length > 0 && (
        <>
          {logoNode && <span className="pn-sep pn-de" />}
          <ul className="pn-list pn-de" role="menubar" style={{ flex: 1, justifyContent: "center" }}>
            {items.map((item, i) => (
              <li key={item.href || `item-${i}`} role="none" className="pn-li">
                {renderPill(item, i, activeHref === item.href)}
              </li>
            ))}
          </ul>
        </>
      )}

      {rightItems.length > 0 && (
        <div className="pn-right-slot pn-de">
          <span className="pn-sep" />
          <ul className="pn-list" role="menubar">
            {rightItems.map((item, i) => (
              <li key={item.href || `right-${i}`} role="none" className="pn-li">
                {renderPill(item, items.length + i, false)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onHamburgerClick && (
        <button className="pn-hamburger" onClick={onHamburgerClick} aria-label="Toggle menu" style={{ minHeight: "44px", minWidth: "44px", padding: "8px" }}>
          <span className="pn-hline" />
          <span className="pn-hline" />
        </button>
      )}
    </div>
  );
}
