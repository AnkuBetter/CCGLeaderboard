import { useEffect, useRef } from "react";

const logoSrc = `${import.meta.env.BASE_URL}logos/xlogo.png`;
const LOGO_ASPECT = 1890 / 2142;
const EXTRUSION_LAYERS = 30;
const ROTATE_X_DEG = -10.313;
const YAW_AMPLITUDE_DEG = 37.242;
const ROLL_AMPLITUDE_DEG = 5.73;
const X_TOP = "clamp(13.4rem, 30vh, 19.75rem)";

export function VideoBackground() {
  const logoRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      const t = time * 0.001;
      const yaw = Math.sin(t * 0.55) * YAW_AMPLITUDE_DEG;
      const roll = Math.cos(t * 0.28) * ROLL_AMPLITUDE_DEG;
      const glowScale = 1 + Math.sin(t * 0.24) * 0.02;
      const sheenShift = Math.sin(t * 0.55) * 10;
      const sheenOpacity = 0.03 + (Math.sin(t * 0.92) * 0.5 + 0.5) * 0.05;

      if (logoRef.current) {
        logoRef.current.style.transform = `translate3d(-50%, 0, 0) perspective(1900px) rotateX(${ROTATE_X_DEG}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(-50%, 0, 0) scale(${glowScale})`;
      }

      if (sheenRef.current) {
        sheenRef.current.style.transform = `translate3d(${sheenShift}px, 0, 38px)`;
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
            radial-gradient(circle at 50% 14%, rgba(134, 100, 255, 0.07) 0%, rgba(134, 100, 255, 0.025) 24%, transparent 44%),
            radial-gradient(circle at 52% 22%, rgba(82, 208, 255, 0.055) 0%, rgba(82, 208, 255, 0.02) 18%, transparent 34%),
            radial-gradient(circle at 50% 35%, rgba(255, 194, 92, 0.04) 0%, rgba(255, 194, 92, 0.015) 18%, transparent 38%)
          `,
        }}
      />

      <div
        ref={glowRef}
        className="absolute left-1/2 rounded-full blur-[82px]"
        style={{
          top: X_TOP,
          width: "clamp(240px, 32vw, 560px)",
          height: "clamp(240px, 32vw, 560px)",
          transform: "translate3d(-50%, 0, 0)",
          background:
            "radial-gradient(circle, rgba(136, 98, 255, 0.12) 0%, rgba(65, 208, 255, 0.08) 34%, rgba(255, 197, 92, 0.05) 58%, rgba(0, 0, 0, 0) 76%)",
        }}
      />

      <div
        ref={logoRef}
        className="absolute left-1/2 will-change-transform"
        style={{
          top: X_TOP,
          width: "clamp(210px, 26vw, 500px)",
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
          <div
            className="absolute inset-0"
            style={{
              transform: "translate3d(0, 0, -72px)",
              opacity: 0.18,
              filter: "blur(14px)",
              background:
                "radial-gradient(circle at 50% 50%, rgba(75, 215, 255, 0.14) 0%, rgba(123, 99, 255, 0.16) 40%, rgba(0, 0, 0, 0.0) 74%)",
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

          {Array.from({ length: EXTRUSION_LAYERS }).map((_, index) => {
            const progress = index / (EXTRUSION_LAYERS - 1);
            const depth = -66 + progress * 66;
            const opacity = 0.86 - progress * 0.18;
            const blur = (1 - progress) * 0.4;

            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  transform: `translate3d(0, 0, ${depth}px)`,
                  opacity,
                  filter: blur > 0 ? `blur(${blur}px)` : "none",
                  background:
                    "linear-gradient(145deg, rgba(10, 10, 16, 0.98) 0%, rgba(36, 28, 64, 0.66) 40%, rgba(12, 12, 18, 0.98) 100%)",
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
              transform: "translate3d(0, 0, 12px)",
              opacity: 0.09,
              background:
                "linear-gradient(150deg, rgba(118, 98, 255, 0.28) 0%, rgba(74, 214, 255, 0.16) 48%, rgba(255, 200, 96, 0.09) 78%, rgba(0, 0, 0, 0) 100%)",
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

          <img
            src={logoSrc}
            alt=""
            className="absolute inset-0 block h-full w-full select-none"
            style={{
              transform: "translate3d(0, 0, 34px)",
              opacity: 0.9,
              filter:
                "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 18px rgba(108, 102, 255, 0.09)) drop-shadow(0 0 12px rgba(92, 224, 255, 0.05))",
            }}
          />

          <div
            ref={sheenRef}
            className="absolute inset-0"
            style={{
              transform: "translate3d(0, 0, 38px)",
              opacity: 0.06,
              background:
                "linear-gradient(118deg, rgba(255,255,255,0.00) 8%, rgba(255,255,255,0.24) 28%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.00) 62%)",
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
