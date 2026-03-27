import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import {
  fetchLeaderboard,
  IS_DYNAMIC_MOCK_ENABLED,
  LEADERBOARD_PAGE_SIZE,
  LeaderboardEntry,
  trimLeaderboardEntries,
} from "../data/leaderboard";
import { LeaderboardRow } from "./LeaderboardRow";

const FLIP_INTERVAL_MS = 10000;
const REFRESH_OFFSET_MS = 5000;
const CACHE_KEY = `finalleaderboard:leaderboard-cache:${
  IS_DYNAMIC_MOCK_ENABLED ? "mock-v2" : "live-v4"
}`;

function readCachedEntries() {
  if (typeof window === "undefined") {
    return [] as LeaderboardEntry[];
  }

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return [] as LeaderboardEntry[];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as LeaderboardEntry[];
    }

    return trimLeaderboardEntries(parsed as LeaderboardEntry[]);
  } catch {
    return [] as LeaderboardEntry[];
  }
}

function writeCachedEntries(entries: LeaderboardEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore local storage failures and keep runtime memory as the primary cache.
  }
}

function getPageCount(entries: LeaderboardEntry[]) {
  return Math.max(1, Math.ceil(entries.length / LEADERBOARD_PAGE_SIZE));
}

export function LeaderboardTable() {
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshTimeoutRef = useRef<number | null>(null);
  const flipTimeoutRef = useRef<number | null>(null);
  const refreshControllerRef = useRef<AbortController | null>(null);
  const activeEntriesRef = useRef<LeaderboardEntry[]>(readCachedEntries());
  const stagedEntriesRef = useRef<LeaderboardEntry[] | null>(null);
  const currentPageRef = useRef(0);

  const [activeEntries, setActiveEntries] = useState<LeaderboardEntry[]>(
    activeEntriesRef.current,
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [flipCycle, setFlipCycle] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 40, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.5,
          delay: 0.6,
          ease: "power2.inOut",
        },
      );
    }
  }, []);

  useEffect(() => {
    activeEntriesRef.current = activeEntries;
  }, [activeEntries]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const clearTimers = () => {
      if (refreshTimeoutRef.current !== null) {
        window.clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }

      if (flipTimeoutRef.current !== null) {
        window.clearTimeout(flipTimeoutRef.current);
        flipTimeoutRef.current = null;
      }
    };

    const commitActiveEntries = (nextEntries: LeaderboardEntry[]) => {
      const trimmedEntries = trimLeaderboardEntries(nextEntries);
      activeEntriesRef.current = trimmedEntries;
      setActiveEntries(trimmedEntries);
      writeCachedEntries(trimmedEntries);
    };

    const refreshLeaderboard = () => {
      refreshControllerRef.current?.abort();
      const controller = new AbortController();
      refreshControllerRef.current = controller;

      fetchLeaderboard(controller.signal)
        .then((nextEntries) => {
          if (nextEntries.length === 0 && activeEntriesRef.current.length > 0) {
            return;
          }

          stagedEntriesRef.current = nextEntries;
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          console.error("Unable to refresh leaderboard data", error);
        });
    };

    const scheduleCycle = () => {
      clearTimers();
      refreshTimeoutRef.current = window.setTimeout(refreshLeaderboard, REFRESH_OFFSET_MS);
      flipTimeoutRef.current = window.setTimeout(handleFlip, FLIP_INTERVAL_MS);
    };

    const handleFlip = () => {
      const hasStagedEntries = Array.isArray(stagedEntriesRef.current);
      const nextActiveEntries = hasStagedEntries
        ? stagedEntriesRef.current ?? activeEntriesRef.current
        : activeEntriesRef.current;

      if (hasStagedEntries) {
        commitActiveEntries(nextActiveEntries);
        stagedEntriesRef.current = null;
      }

      const nextPageCount = getPageCount(nextActiveEntries);
      const nextPageIndex =
        nextPageCount <= 1 ? 0 : (currentPageRef.current + 1) % nextPageCount;
      const shouldAnimate = nextPageCount > 1 || hasStagedEntries;

      currentPageRef.current = nextPageIndex;
      setCurrentPage(nextPageIndex);

      if (shouldAnimate) {
        setFlipCycle((currentCycle) => currentCycle + 1);
      }

      scheduleCycle();
    };

    const bootstrap = async () => {
      try {
        refreshControllerRef.current?.abort();
        const controller = new AbortController();
        refreshControllerRef.current = controller;
        const initialEntries = await fetchLeaderboard(controller.signal);
        commitActiveEntries(initialEntries);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Unable to load initial leaderboard data", error);
        }
      } finally {
        scheduleCycle();
      }
    };

    bootstrap();

    return () => {
      clearTimers();
      refreshControllerRef.current?.abort();
    };
  }, []);

  const pageCount = getPageCount(activeEntries);
  const safePageIndex = pageCount <= 1 ? 0 : currentPage % pageCount;
  const pageStart = safePageIndex * LEADERBOARD_PAGE_SIZE;
  const visibleEntries = activeEntries.slice(
    pageStart,
    pageStart + LEADERBOARD_PAGE_SIZE,
  );
  const fillerRows = Math.max(0, LEADERBOARD_PAGE_SIZE - visibleEntries.length);
  const pageKey = `page-${safePageIndex}-cycle-${flipCycle}`;

  return (
    <div
      ref={containerRef}
      className="glass-panel leaderboard-shell mx-auto w-full max-w-none overflow-hidden"
      style={{ opacity: 0 }}
    >
      <div className="leaderboard-table-wrap overflow-x-auto" style={{ perspective: "1800px" }}>
        <AnimatePresence initial={false}>
          {visibleEntries.length > 0 ? (
            <motion.div
              key={`bloom-${pageKey}`}
              className="leaderboard-page-bloom"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.34, 0],
                transition: {
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                  times: [0, 0.25, 1],
                },
              }}
              exit={{ opacity: 0 }}
            />
          ) : null}

          {visibleEntries.length > 0 ? (
            <motion.div
              key={`sheen-${pageKey}`}
              className="leaderboard-page-sheen"
              initial={{ opacity: 0, x: "-44%", skewX: -18 }}
              animate={{
                opacity: [0, 0.42, 0],
                x: "136%",
                transition: {
                  duration: 0.95,
                  ease: [0.22, 1, 0.36, 1],
                  times: [0, 0.32, 1],
                },
              }}
              exit={{ opacity: 0 }}
            />
          ) : null}
        </AnimatePresence>

        <table className="w-full min-w-[920px]" aria-label="Leaderboard rankings">
          <thead>
            <tr className="leaderboard-head-row border-b border-white/12">
              <th
                scope="col"
                className="leaderboard-head-cell w-[7%] text-left font-mono font-medium uppercase tracking-widest text-neutral-400"
              >
                <span className="leaderboard-head-label">//RANK</span>
              </th>
              <th
                scope="col"
                className="leaderboard-head-cell w-[20%] text-left font-mono font-medium uppercase tracking-widest text-neutral-400"
              >
                <span className="leaderboard-head-label">//NAME</span>
              </th>
              <th
                scope="col"
                className="leaderboard-head-cell w-[37%] text-left font-mono font-medium uppercase tracking-widest text-neutral-400"
              >
                <span className="leaderboard-head-label">//REPUTATION</span>
              </th>
              <th
                scope="col"
                className="leaderboard-head-cell w-[14%] text-left font-mono font-medium uppercase tracking-widest text-neutral-400"
              >
                <span className="leaderboard-head-label">//COMPANY</span>
              </th>
              <th
                scope="col"
                className="leaderboard-head-cell w-[22%] text-right font-mono font-medium uppercase tracking-widest text-neutral-400"
              >
                <span className="leaderboard-head-label">//SCORE</span>
              </th>
            </tr>
          </thead>

          <AnimatePresence initial={false} mode="wait">
            <motion.tbody
              key={pageKey}
              initial={{
                opacity: 0.72,
                filter: "blur(4px) saturate(1.08) brightness(1.08)",
              }}
              animate={{
                opacity: 1,
                filter: "blur(0px) saturate(1) brightness(1)",
                transition: {
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              exit={{
                opacity: 0.68,
                filter: "blur(4px) saturate(1.06) brightness(1.05)",
                transition: {
                  duration: 0.38,
                  ease: [0.4, 0, 1, 1],
                },
              }}
              style={{
                willChange: "opacity, filter",
              }}
            >
              {visibleEntries.length > 0 ? (
                visibleEntries.map((entry, index) => (
                  <LeaderboardRow
                    key={entry.id}
                    entry={entry}
                    index={index}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="leaderboard-body-cell py-[clamp(3rem,6vw,4.25rem)] text-center font-mono text-[clamp(0.82rem,0.95vw,1rem)] uppercase tracking-[0.22em] text-neutral-500"
                  >
                    Awaiting leaderboard data
                  </td>
                </tr>
              )}

              {visibleEntries.length > 0
                ? Array.from({ length: fillerRows }).map((_, fillerIndex) => (
                    <tr key={`filler-${safePageIndex}-${fillerIndex}`} aria-hidden="true">
                      <td className="leaderboard-body-cell opacity-0" colSpan={5}>
                        &nbsp;
                      </td>
                    </tr>
                  ))
                : null}
            </motion.tbody>
          </AnimatePresence>
        </table>
      </div>
    </div>
  );
}
