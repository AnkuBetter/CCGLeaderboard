import { useEffect, useRef } from "react";

const logoSrc = `${import.meta.env.BASE_URL}logos/xlogo.png`;

export function VideoBackground() {
  const logoRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      const t = time * 0.001;
      const yaw = Math.sin(t * 0.55) * 10;
      const roll = Math.cos(t * 0.32) * 2.8;
      const bob = Math.sin(t * 0.42) * 10;
      const scale = 1 + Math.sin(t * 0.24) * 0.018;
      const shimmer = 0.18 + (Math.sin(t * 1.1) * 0.5 + 0.5) * 0.18;

      if (logoRef.current) {
        logoRef.current.style.transform = `translate3d(-50%, ${bob}px, 0) perspective(1400px) rotateX(-6deg) rotateY(${yaw}deg) rotateZ(${roll}deg) scale(${scale})`;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(-50%, ${bob * 0.45}px, 0) scale(${1 + Math.sin(t * 0.28) * 0.035})`;
      }

      if (shimmerRef.current) {
        shimmerRef.current.style.opacity = `${shimmer}`;
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
        }}
      >
        <div className="relative w-full">
          <img
            src={logoSrc}
            alt=""
            className="block h-auto w-full select-none"
            style={{
              filter:
                "drop-shadow(0 18px 30px rgba(0, 0, 0, 0.55)) drop-shadow(0 0 34px rgba(108, 102, 255, 0.14)) drop-shadow(0 0 22px rgba(92, 224, 255, 0.08))",
            }}
          />

          <img
            ref={shimmerRef}
            src={logoSrc}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full select-none mix-blend-screen"
            style={{
              opacity: 0.24,
              filter: "blur(10px) brightness(1.25)",
            }}
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 0.16,
              mixBlendMode: "screen",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.42) 0%, rgba(108,102,255,0.26) 36%, rgba(92,224,255,0.18) 58%, rgba(255,198,92,0.24) 82%, rgba(255,255,255,0.12) 100%)",
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
        </div>
      </div>
    </div>
  );
}
