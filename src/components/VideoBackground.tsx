import { useEffect, useRef } from "react";

const LOGO_SRC = `${import.meta.env.BASE_URL}logos/xlogo.png`;
const LOGO_ASPECT = 1890 / 2142;
const EXTRUSION_LAYERS = 30;
const BASE_ROTATE_X = -12;
const BASE_ROTATE_Y = 27;
const BASE_ROTATE_Z = -3;

export function VideoBackground() {
  const objectRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      const t = time * 0.001;
      const yaw = Math.sin(t * 0.55) * 9;
      const roll = Math.cos(t * 0.28) * 2.4;
      const lift = Math.sin(t * 0.42) * 8;
      const scale = 1 + Math.sin(t * 0.2) * 0.01;
      const shadowScale = 1 + Math.sin(t * 0.24) * 0.016;

      if (objectRef.current) {
        objectRef.current.style.transform = `translate3d(-50%, ${lift}px, 0) perspective(2200px) rotateX(${BASE_ROTATE_X}deg) rotateY(${BASE_ROTATE_Y + yaw}deg) rotateZ(${BASE_ROTATE_Z + roll}deg) scale(${scale})`;
      }

      if (shadowRef.current) {
        shadowRef.current.style.transform = `translate3d(-50%, ${lift * 0.35}px, 0) scale(${shadowScale})`;
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
            radial-gradient(circle at 50% 10%, rgba(64, 180, 255, 0.07) 0%, rgba(64, 180, 255, 0.016) 26%, transparent 42%),
            radial-gradient(circle at 50% 58%, rgba(39, 115, 196, 0.035) 0%, rgba(39, 115, 196, 0.012) 24%, transparent 44%),
            linear-gradient(180deg, rgba(8, 10, 16, 0.16) 0%, rgba(0, 0, 0, 0) 36%)
          `,
        }}
      />

      <div
        ref={shadowRef}
        className="video-x-shadow absolute left-1/2 blur-[58px]"
        style={{
          transform: "translate3d(-50%, 0, 0)",
          background:
            "radial-gradient(ellipse at center, rgba(19, 98, 184, 0.36) 0%, rgba(12, 52, 108, 0.17) 42%, rgba(0, 0, 0, 0) 74%)",
        }}
      />

      <div
        ref={objectRef}
        className="video-x-object absolute left-1/2 will-change-transform"
        style={{
          transform: "translate3d(-50%, 0, 0)",
          transformStyle: "preserve-3d",
          filter: "blur(1.05px) saturate(1)",
          opacity: 0.92,
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
            const progress = index / (EXTRUSION_LAYERS - 1);
            const depth = -156 + progress * 144;
            const xOffset = -progress * 48;
            const yOffset = progress * 22;
            const opacity = 0.92 - progress * 0.26;
            const blur = (1 - progress) * 0.34;

            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  transform: `translate3d(${xOffset}px, ${yOffset}px, ${depth}px)`,
                  opacity,
                  filter: blur > 0 ? `blur(${blur}px)` : "none",
                  background:
                    "linear-gradient(145deg, rgba(43, 194, 255, 1) 0%, rgba(29, 168, 255, 1) 38%, rgba(15, 133, 241, 1) 100%)",
                  WebkitMaskImage: `url(${LOGO_SRC})`,
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  WebkitMaskSize: "contain",
                  maskImage: `url(${LOGO_SRC})`,
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
              transform: "translate3d(-28px, 14px, -60px)",
              opacity: 0.38,
              filter: "blur(17px)",
              background:
                "linear-gradient(150deg, rgba(37, 176, 255, 0.68) 0%, rgba(14, 110, 214, 0.16) 70%, rgba(0, 0, 0, 0) 100%)",
              WebkitMaskImage: `url(${LOGO_SRC})`,
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "contain",
              maskImage: `url(${LOGO_SRC})`,
              maskRepeat: "no-repeat",
              maskPosition: "center",
              maskSize: "contain",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              transform: "translate3d(-12px, 8px, 10px)",
              opacity: 0.13,
              background:
                "linear-gradient(155deg, rgba(255, 255, 255, 0.28) 0%, rgba(69, 196, 255, 0.18) 32%, rgba(0, 0, 0, 0) 62%)",
              WebkitMaskImage: `url(${LOGO_SRC})`,
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "contain",
              maskImage: `url(${LOGO_SRC})`,
              maskRepeat: "no-repeat",
              maskPosition: "center",
              maskSize: "contain",
              mixBlendMode: "screen",
            }}
          />

          <img
            src={LOGO_SRC}
            alt=""
            className="absolute inset-0 block h-full w-full select-none"
            style={{
              transform: "translate3d(0, 0, 36px)",
              filter:
                "drop-shadow(0 18px 28px rgba(0, 0, 0, 0.3)) drop-shadow(-18px 22px 24px rgba(16, 94, 184, 0.28))",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              transform: "translate3d(0, 0, 42px)",
              opacity: 0.12,
              background:
                "linear-gradient(118deg, rgba(255,255,255,0) 4%, rgba(255,255,255,0.38) 24%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0) 58%)",
              WebkitMaskImage: `url(${LOGO_SRC})`,
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              WebkitMaskSize: "contain",
              maskImage: `url(${LOGO_SRC})`,
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
