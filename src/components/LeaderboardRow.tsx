import { LeaderboardEntry } from "../data/leaderboard";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  index: number;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const badgeClass =
      rank === 1
        ? "border-tertiary/30 bg-tertiary/15 text-tertiary"
        : rank === 2
          ? "border-neutral-300/25 bg-white/10 text-neutral-100"
          : "border-amber-500/25 bg-amber-500/10 text-amber-300";
    const accentClass =
      rank === 1
        ? "leaderboard-rank-wrap--gold"
        : rank === 2
          ? "leaderboard-rank-wrap--silver"
          : "leaderboard-rank-wrap--bronze";

    return (
      <span className={`leaderboard-rank-wrap ${accentClass}`}>
        <span
          className={`leaderboard-rank-badge inline-flex items-center justify-center rounded-full border font-mono font-semibold ${badgeClass}`}
        >
          {String(rank).padStart(2, "0")}
        </span>
      </span>
    );
  }

  return (
    <span className="leaderboard-rank-text font-mono text-neutral-400">
      {String(rank).padStart(2, "0")}
    </span>
  );
}

function ChampionAvatar({ name, imageUrl, rank }: { name: string; imageUrl: string; rank: number }) {
  return (
    <img
      src={imageUrl}
      alt={`${name} profile image`}
      loading="lazy"
      className={`leaderboard-avatar select-none object-contain ${
        rank === 1 ? "leaderboard-avatar--rank-one" : ""
      }`}
    />
  );
}

export function LeaderboardRow({ entry, index }: LeaderboardRowProps) {
  const rowClass =
    entry.rank === 1
      ? "rank-gold leaderboard-top-row leaderboard-top-row--gold row-hover"
      : entry.rank === 2
        ? "rank-silver leaderboard-top-row leaderboard-top-row--silver row-hover"
        : entry.rank === 3
          ? "rank-bronze leaderboard-top-row leaderboard-top-row--bronze row-hover"
          : `row-hover border-l-2 border-transparent ${
              index % 2 === 0 ? "bg-white/[0.02]" : ""
            }`;

  return (
    <tr
      className={`${rowClass} cursor-pointer transition-all duration-200 ease-in`}
      tabIndex={0}
      aria-label={`Rank ${entry.rank}: ${entry.championName}`}
    >
      <td className="leaderboard-body-cell text-left align-middle">
        <RankBadge rank={entry.rank} />
      </td>

      <td className="leaderboard-body-cell align-middle">
        <div className="flex items-center gap-[clamp(0.6rem,0.9vw,1rem)]">
          <ChampionAvatar name={entry.championName} imageUrl={entry.avatarUrl} rank={entry.rank} />
          <div className="min-w-0">
            <span className="leaderboard-user block truncate">
              {entry.championName}
            </span>
          </div>
        </div>
      </td>

      <td className="leaderboard-body-cell align-middle">
        <span className="leaderboard-handle text-neutral-300">{entry.nickname}</span>
      </td>

      <td className="leaderboard-body-cell align-middle">
        <span className="leaderboard-company font-sans text-neutral-200">{entry.companyName}</span>
      </td>

      <td className="leaderboard-body-cell text-right align-middle">
        <span className="leaderboard-metric font-mono font-semibold text-tertiary">
          {entry.score.toLocaleString()}
        </span>
      </td>
    </tr>
  );
}
