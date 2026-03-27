import { LeaderboardTable } from "./LeaderboardTable";
import { VideoBackground } from "./VideoBackground";

export function HeroSection() {
  return (
    <main className="leaderboard-viewport relative w-full overflow-hidden">
      <VideoBackground />

      <div className="content-shell layout-shell relative z-10 mx-auto flex w-full flex-col items-center">
        <section className="w-full" aria-labelledby="leaderboard-heading">
          <h1 id="leaderboard-heading" className="sr-only">
            Leaderboard Rankings
          </h1>
          <LeaderboardTable />
        </section>
      </div>
    </main>
  );
}

