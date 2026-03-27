import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { AuroraText } from "./AuroraText";

export function HeaderNav() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power2.inOut" },
      );
    }
  }, []);

  return (
    <header
      ref={navRef}
      className="pointer-events-none absolute inset-0 z-50"
      role="banner"
    >
      <div
        className="absolute left-[clamp(8px,1.15vw,24px)] flex items-end justify-start"
        style={{
          bottom: "max(env(safe-area-inset-bottom), clamp(0.5rem, 0.95vw, 1rem))",
        }}
      >
        <img
          src="/logos/betterx-logo.png"
          alt="BetterX logo"
          className="leaderboard-corner-logo block h-[clamp(16px,1.8vw,28px)] w-auto max-w-[clamp(84px,10vw,162px)] object-contain drop-shadow-[0_0_14px_rgba(255,255,255,0.12)]"
        />
      </div>

      <div
        className="leaderboard-title-anchor leaderboard-title-shell absolute inset-x-0 flex justify-center px-[clamp(16px,3vw,48px)] text-center"
      >
        <span
          className="leaderboard-title-text font-bold uppercase text-hero-text"
        >
          <AuroraText>LEADERBOARD</AuroraText>
        </span>
      </div>

      <div
        className="absolute right-[clamp(8px,1.15vw,24px)] flex items-end justify-end"
        style={{
          bottom: "max(env(safe-area-inset-bottom), clamp(0.5rem, 0.95vw, 1rem))",
        }}
      >
        <img
          src="/logos/ccg-logo.png"
          alt="CCG logo"
          className="leaderboard-corner-logo block h-[clamp(16px,1.8vw,28px)] w-auto max-w-[clamp(84px,10vw,162px)] object-contain drop-shadow-[0_0_14px_rgba(255,255,255,0.12)]"
        />
      </div>
    </header>
  );
}
