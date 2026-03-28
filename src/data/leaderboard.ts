const DEFAULT_DISPLAY_API_URL =
  "https://businesscards.gobetterx.com/v1/leaderboard/list/public";
const rawDisplayApiUrl = import.meta.env.VITE_LEADERBOARD_DISPLAY_URL;
const rawDynamicMockFlag = import.meta.env.VITE_LEADERBOARD_DYNAMIC_MOCK;
const DISPLAY_API_URL =
  typeof rawDisplayApiUrl === "string" && rawDisplayApiUrl.trim().length > 0
    ? rawDisplayApiUrl.replace(/\/+$/, "")
    : DEFAULT_DISPLAY_API_URL;
export const IS_DYNAMIC_MOCK_ENABLED =
  typeof rawDynamicMockFlag === "string" &&
  rawDynamicMockFlag.trim().toLowerCase() === "true";
const SOUTH_PARK_AVATAR_COUNT = 20;
const AVATAR_BASE_URL = `${import.meta.env.BASE_URL}avatars/southpark`;
const JOHNNY_BRAVO_AVATAR_URL = `${import.meta.env.BASE_URL}avatars/special/johnnybravo.png`;
const POPEYE_AVATAR_URL = `${import.meta.env.BASE_URL}avatars/special/popeye.png`;

export const MAX_LEADERBOARD_ENTRIES = 24;
export const LEADERBOARD_PAGE_SIZE = 8;
export const COMPANY_PLACEHOLDER = ". . .";

export interface LeaderboardListItem {
  id: string;
  rank: number;
  display_name: string;
  company?: string;
  value: number;
}

interface LeaderboardListResponse {
  generated_at?: string;
  items?: LeaderboardListItem[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  nickname: string;
  championName: string;
  companyName: string;
  score: number;
  avatarUrl: string;
}

const HANDLE_BY_RANK: Record<number, string> = {
  1: "Unlocked God Mode",
  2: "They'll Sell You Your Car Back",
  3: "Someone Drug Test This Person",
  4: "If They Hand You a Card, Say Yes",
  5: "Closing Deals Like a Psychopath",
  6: "Moving Like the IRS Is Behind Them",
  7: "Networking Like Child Support Is Due",
  8: "Built Different, According to Them",
  9: "Practiced the Elevator Pitch in the Mirror",
  10: "Walking Like They Own the Place",
  11: "People Are Asking About Them",
  12: "Still Rating Body Work in the Parking Lot",
  13: "LinkedIn Pic Still From 2014",
  14: "Someone's Tracking Their Location",
  15: "Took 12 Snacks, Gave No Cards",
  16: "One Card In, Already Tired",
  17: "Googled \"How to Network\" in the Uber",
  18: "Standing Like a Check Engine Light",
  19: "Thinks Networking Means Wi-Fi",
  20: "Came for the Free Coffee",
  21: "Definitely Peaked in High School",
  22: "Shook 40 Hands, Forgot Every Name",
  23: "Started Pitching Before the Badge Printed",
  24: "Acting Like the Keynote Speaker",
};

const MOCK_CHAMPION_PROFILES = [
  { id: "mock-01", displayName: "Aiden Cross", company: "BetterX Dallas", baseValue: 124 },
  { id: "mock-02", displayName: "Mia Alvarez", company: "Better Collision Phoenix", baseValue: 120 },
  { id: "mock-03", displayName: "Jaxon Price", company: "BetterX Austin", baseValue: 116 },
  { id: "mock-04", displayName: "Chloe Bennett", company: "Certified Collision Group", baseValue: 112 },
  { id: "mock-05", displayName: "Noah Ramirez", company: "Better Collision Tampa", baseValue: 108 },
  { id: "mock-06", displayName: "Ava Stone", company: "BetterX Houston", baseValue: 104 },
  { id: "mock-07", displayName: "Mason Reed", company: "Collision Leaders Summit", baseValue: 100 },
  { id: "mock-08", displayName: "Harper Brooks", company: "BetterX Atlanta", baseValue: 96 },
  { id: "mock-09", displayName: "Ethan Hayes", company: "CCG Nashville", baseValue: 92 },
  { id: "mock-10", displayName: "Luna Parker", company: "Better Collision Orlando", baseValue: 88 },
  { id: "mock-11", displayName: "Logan Cole", company: "BetterX Chicago", baseValue: 84 },
  { id: "mock-12", displayName: "Ella Morgan", company: "Collision Growth Group", baseValue: 80 },
  { id: "mock-13", displayName: "Lucas Foster", company: "Better Collision Miami", baseValue: 76 },
  { id: "mock-14", displayName: "Grace Simmons", company: "BetterX Charlotte", baseValue: 72 },
  { id: "mock-15", displayName: "Benjamin Ward", company: "Repair Forward", baseValue: 68 },
  { id: "mock-16", displayName: "Sofia Bryant", company: "CCG Denver", baseValue: 64 },
  { id: "mock-17", displayName: "Henry Ross", company: "Better Collision Raleigh", baseValue: 60 },
  { id: "mock-18", displayName: "Scarlett James", company: "BetterX Seattle", baseValue: 56 },
  { id: "mock-19", displayName: "Wyatt Gray", company: "Collision Connect", baseValue: 52 },
  { id: "mock-20", displayName: "Nora Hughes", company: "Better Collision San Diego", baseValue: 48 },
  { id: "mock-21", displayName: "Owen Myers", company: "BetterX Detroit", baseValue: 44 },
  { id: "mock-22", displayName: "Zoe Bell", company: "CCG Minneapolis", baseValue: 40 },
  { id: "mock-23", displayName: "Jack Turner", company: "Better Collision Boston", baseValue: 36 },
  { id: "mock-24", displayName: "Lily Cooper", company: "BetterX Los Angeles", baseValue: 32 },
] as const;

let mockRefreshCycle = 0;

function getRankAvatarUrl(rank: number) {
  const normalizedRank = Math.max(rank, 1);

  if (normalizedRank === 1) {
    return JOHNNY_BRAVO_AVATAR_URL;
  }

  if (normalizedRank === 2) {
    return POPEYE_AVATAR_URL;
  }

  const avatarIndex = ((normalizedRank - 1) % SOUTH_PARK_AVATAR_COUNT) + 1;

  return `${AVATAR_BASE_URL}/rank-${String(avatarIndex).padStart(2, "0")}.png`;
}

function createDynamicMockItems(): LeaderboardListItem[] {
  mockRefreshCycle += 1;

  return MOCK_CHAMPION_PROFILES.map((profile, index) => {
    const rank = index + 1;
    const value = profile.baseValue + ((mockRefreshCycle + index * 2) % 3);

    return {
      id: profile.id,
      rank,
      display_name: profile.displayName,
      company: profile.company,
      value,
    };
  });
}

export function mapLeaderboardEntry(item: LeaderboardListItem): LeaderboardEntry {
  const championName = item.display_name?.trim() || "Unknown Champion";
  const rawValue = Number.isFinite(item.value) ? item.value : 0;

  return {
    id: item.id,
    rank: item.rank,
    nickname: HANDLE_BY_RANK[item.rank] ?? `Rank ${String(item.rank).padStart(2, "0")}`,
    championName,
    companyName: item.company?.trim() || COMPANY_PLACEHOLDER,
    score: Math.max(0, rawValue) * 1000,
    avatarUrl: getRankAvatarUrl(item.rank),
  };
}

export function trimLeaderboardEntries(entries: LeaderboardEntry[]) {
  return [...entries]
    .filter((entry) => typeof entry.id === "string" && entry.id.length > 0)
    .sort((left, right) => left.rank - right.rank)
    .slice(0, MAX_LEADERBOARD_ENTRIES);
}

export async function fetchLeaderboard(signal?: AbortSignal) {
  if (IS_DYNAMIC_MOCK_ENABLED) {
    return trimLeaderboardEntries(createDynamicMockItems().map(mapLeaderboardEntry));
  }

  const response = await fetch(DISPLAY_API_URL, {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Leaderboard request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as LeaderboardListResponse;
  const items = Array.isArray(payload.items) ? payload.items : [];

  return trimLeaderboardEntries(items.map(mapLeaderboardEntry));
}
