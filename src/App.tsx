import "./index.css";

import { startTransition, useEffect, useState, type CSSProperties } from "react";

import { HeaderNav } from "./components/HeaderNav";
import { HeroSection } from "./components/HeroSection";

const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;
const MIN_STAGE_SCALE = 1.12;

function getDisplayOverride() {
  if (typeof window === "undefined") {
    return null;
  }

  const displayParam = new URLSearchParams(window.location.search)
    .get("display")
    ?.trim()
    .toLowerCase();

  if (displayParam === "tv") {
    return true;
  }

  if (displayParam === "default" || displayParam === "desktop" || displayParam === "laptop") {
    return false;
  }

  return null;
}

function getStageState() {
  if (typeof window === "undefined") {
    return { enabled: false, scale: 1 };
  }

  const displayOverride = getDisplayOverride();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / Math.max(height, 1);
  const scale = Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT);
  const autoEnabled = scale > MIN_STAGE_SCALE && aspect >= 1.68 && aspect <= 1.92;
  const enabled = displayOverride ?? autoEnabled;

  return {
    enabled,
    scale: enabled ? scale : 1,
  };
}

export default function App() {
  const [stageState, setStageState] = useState(getStageState);

  useEffect(() => {
    const updateStageState = () => {
      const nextState = getStageState();
      startTransition(() => {
        setStageState(nextState);
      });
    };

    updateStageState();
    window.addEventListener("resize", updateStageState);

    return () => {
      window.removeEventListener("resize", updateStageState);
    };
  }, []);

  const stageStyle: CSSProperties | undefined = stageState.enabled
    ? {
        width: `${STAGE_WIDTH}px`,
        height: `${STAGE_HEIGHT}px`,
        transform: `scale(${stageState.scale})`,
      }
    : undefined;

  return (
    <div className={`tv-shell ${stageState.enabled ? "tv-shell--scaled" : ""}`}>
      <div
        className={`app-shell relative overflow-x-hidden bg-background text-foreground ${
          stageState.enabled ? "tv-stage" : "min-h-screen"
        }`}
        style={stageStyle}
      >
        <HeaderNav />
        <HeroSection />
      </div>
    </div>
  );
}
