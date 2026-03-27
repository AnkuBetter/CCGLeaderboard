import { useEffect, useRef } from "react";

const logoSrc = `${import.meta.env.BASE_URL}logos/xlogo.png`;
const LOGO_ASPECT = 1890 / 2142;
const EXTRUSION_LAYERS = 12;

export function VideoBackground() {
  const logoRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      const t = time * 0.001;
      const yaw = Math.sin(t * 0.55) * 10.5;
      const roll = Math.cos(t * 0.32) * 3.1;
      const bob = Math.sin(t * 0.42) * 10;
      const scale = 1 + Math.sin(t * 0.24) * 0.018;
      const glowScale = 1 + Math.sin(t * 0.28) * 0.035;
      const glowY = bob * 0.45;
      const sheenShift = Math.sin(t * 0.45) * 12;
      const sheenOpacity = 0.10 + (Math.sin(t * 1.05) * 0.5 + 0.5) * 0.12;

      if (logoRef.current) {
        logoRef.current.style.transform = `translate3d(-50%, ${bob}px, 0) perspective(1600px) rotateX(-8deg) rotateY(${yaw}deg) rotateZ(${roll}deg) scale(${scale})`;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(-50%, ${glowY}px, 0) scale(${glowScale})`;
      }

      if (sheenRef.current) {
        sheenRef.current.style.transform = `translate3d(${sheenShift}px, 0, 34px)`;
        sheenRef.current.style.opacity = `${sheenOpacity}`;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 16%, rgba(134, 100, 255, 0.10) 0%, rgba(134, 100, 255, 0.04) 24%, transparent 44%),
            radial-gradient(circle at 52% 22%, rgba(82, 208, 255, 0.08) 0%, rgba(82, 208, 255, 0.03) 18%, transparent 34%),
            radial-gradient(circle at 50% 34%, rgba(255, 194, 92, 0.06) 0%, rgba(255, 194, 92, 0.02) 18%, transparent 38%)
          `,
        }}
      />

      <div
        ref={glowRef}
        className="absolute left-1/2 rounded-full blur-[72px]"
        style={{
          top: "clamp(4.5rem, 11vh, 8rem)",
          width: "clamp(240px, 34vw, 620px)",
          height: "clamp(240px, 34vw, 620px)",
          transform: "translate3d(-50%, 0, 0)",
          background:
            "radial-gradient(circle, rgba(136, 98, 255, 0.20) 0%, rgba(65, 208, 255, 0.13) 34%, rgba(255, 197, 92, 0.10) 58%, rgba(0, 0, 0, 0) 76%)",
        }}
      />

      <div
        ref={logoRef}
        className="absolute left-1/2 will-change-transform"
        style={{
          top: "clamp(4.5rem, 11vh, 8rem)",
          width: "clamp(210px, 28vw, 520px)",
          transform: "translate3d(-50%, 0, 0)",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="relative w-full"
          style={{
            aspectRatio: `${LOGO_ASPECT}`,
            transformStyle: "preserve-3d",
          }}
        >
          {Array.from({ length: EXTRUSION_LAYERS }).map((_, index) => {
            const depth = -26 + index * 2.2;
            const xOffset = index * 1.2;
            const yOffset = index * 0.65;
            const opacity = 0.34 - index * 0.017;
            const blur = Math.max(0.4, (EXTRUSION_LAYERS - index) * 0.14);

            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  transform: `translate3d(${xOffset}px, ${yOffset}px, ${depth}px)`,
                  opacity,
                  filter: `blur(${blur}px)`,
                  background:
                    "linear-gradient(145deg, rgba(16, 16, 22, 0.95) 0%, rgba(48, 34, 78, 0.70) 42%, rgba(17, 17, 24, 0.98) 100%)",
                  WebkitMaskImage: `url(${logoSrc})`,
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskImage: `url(${logoSrc})`,
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  maskSize: "contain",
                }}
              />
            );
          })}

          <div
            className="absolute inset-0"
            style={{
              transform: "translate3d(8px, 5px, 6px)",
              opacity: 0.22,
              filter: "blur(10px)",
              background:
                "linear-gradient(160deg, rgba(125, 100, 255, 0.46) 0%, rgba(75, 215, 255, 0.24) 48%, rgba(0, 0, 0, 0) 78%)",
              WebkitMaskImage: `url(${logoSrc})`,
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "contain",
              maskImage: `url(${logoSrc})`,
              maskRepeat: "no-repeat",
              maskPosition: "center",
              maskSize: "contain",
            }}
          />

          <img
            src={logoSrc}
            alt=""
            className="absolute inset-0 block h-full w-full select-none"
            style={{
              transform: "translate3d(0, 0, 30px)",
              filter:
                "drop-shadow(0 22px 34px rgba(0, 0, 0, 0.58)) drop-shadow(0 0 28px rgba(108, 102, 255, 0.14)) drop-shadow(0 0 18px rgba(92, 224, 255, 0.07))",
            }}
          />

          <div
            ref={sheenRef}
            className="absolute inset-0"
            style={{
              transform: "translate3d(0, 0, 34px)",
              opacity: 0.16,
              background:
                "linear-gradient(118deg, rgba(255,255,255,0.00) 6%, rgba(255,255,255,0.42) 28%, rgba(255,255,255,0.08) 46%, rgba(255,255,255,0.00) 64%)",
              WebkitMaskImage: `url(${logoSrc})`,
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "contain",
              maskImage: `url(${logoSrc})`,
              maskRepeat: "no-repeat",
              maskPosition: "center",
              maskSize: "contain",
              mixBlendMode: "screen",
            }}
          />
        </div>
      </div>
    </div>
  );
}
