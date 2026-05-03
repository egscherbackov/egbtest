"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface GooeyNavItem {
  label: string;
  href: string;
}

interface GooeyNavProps {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
  className?: string;
}

export default function GooeyNav({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  className = "",
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const pathname = usePathname();

  useEffect(() => {
    const idx = items.findIndex((item) => {
      if (item.href === pathname) return true;
      if (item.href.length > 1 && pathname.startsWith(item.href)) return true;
      return false;
    });
    if (idx !== -1) setActiveIndex(idx);
  }, [pathname, items]);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const makeParticles = useCallback((element: HTMLSpanElement) => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const rotate = noise(r / 10);
      const p = {
        start: getXY(d[0], particleCount - i, particleCount),
        end: getXY(d[1] + noise(7), particleCount - i, particleCount),
        time: t,
        scale: 1 + noise(0.2),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
      };
      element.classList.remove("active");

      setTimeout(() => {
        const particle = document.createElement("span");
        const point = document.createElement("span");
        particle.classList.add("particle");
        particle.style.setProperty("--start-x", `${p.start[0]}px`);
        particle.style.setProperty("--start-y", `${p.start[1]}px`);
        particle.style.setProperty("--end-x", `${p.end[0]}px`);
        particle.style.setProperty("--end-y", `${p.end[1]}px`);
        particle.style.setProperty("--time", `${p.time}ms`);
        particle.style.setProperty("--scale", `${p.scale}`);
        particle.style.setProperty("--color", `var(--gooey-color-${p.color}, white)`);
        particle.style.setProperty("--rotate", `${p.rotate}deg`);
        point.classList.add("point");
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => element.classList.add("active"));
        setTimeout(() => { try { element.removeChild(particle); } catch { /* noop */ } }, t);
      }, 30);
    }
  }, [animationTime, particleCount, particleDistances, particleR, timeVariance, colors]);

  const updateEffectPosition = useCallback((element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();
    const styles = {
      left: `${pos.x - cr.x}px`,
      top: `${pos.y - cr.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    textRef.current.innerText = element.innerText;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
      const anchor = e.currentTarget;
      if (activeIndex === index) return;
      setActiveIndex(index);
      updateEffectPosition(anchor);
      if (filterRef.current) {
        filterRef.current.querySelectorAll(".particle").forEach((p) => filterRef.current!.removeChild(p));
        makeParticles(filterRef.current);
      }
      if (textRef.current) {
        textRef.current.classList.remove("active");
        void textRef.current.offsetWidth;
        textRef.current.classList.add("active");
      }
    },
    [activeIndex, updateEffectPosition, makeParticles]
  );

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll("li")[activeIndex] as HTMLElement | undefined;
    if (activeLi) {
      updateEffectPosition(activeLi.querySelector("a") as HTMLElement ?? activeLi);
      textRef.current?.classList.add("active");
    }
    const ro = new ResizeObserver(() => {
      const li = navRef.current?.querySelectorAll("li")[activeIndex] as HTMLElement | undefined;
      if (li) updateEffectPosition(li.querySelector("a") as HTMLElement ?? li);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [activeIndex, updateEffectPosition]);

  return (
    <div className={`gooey-nav-container ${className}`} ref={containerRef}>
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li key={index} className={activeIndex === index ? "active" : ""}>
              <Link href={item.href} onClick={(e) => handleClick(e, index)}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} />
      <span className="effect text" ref={textRef} />
    </div>
  );
}
