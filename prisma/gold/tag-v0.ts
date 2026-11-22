// Gold set, round 0: first tags for the 5 original videos (2026-11-22).
//
// Sources, per fact:
//   YOUTUBE_API — official videos.list data: creator-set recording location,
//                 live-broadcast start time, description, tags.
//   AI          — read by Claude Code from the title, tags, thumbnail and
//                 YouTube's auto-generated chapter titles. NOT yet checked
//                 against the footage; every video stays UNREVIEWED until a
//                 person watches it and confirms (that's what makes it gold).
//
// Re-runnable: it deletes this script's own earlier ExtractionRun/Plays/Wins
// for each video before writing, and upserts casinos/providers/games/aliases.
//
// Run:  npx tsx prisma/gold/tag-v0.ts            (dev, via .env.local)
//       DATABASE_URL=<prod url> npx tsx prisma/gold/tag-v0.ts
import { config } from "dotenv";
import { PrismaClient, type Prisma } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local", quiet: true });
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const RUN_MODEL = "claude-code-session";
const RUN_PROMPT = "hand-tag-v0";
const YT_KEY = process.env.YOUTUBE_API_KEY;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const slugify = (s: string) => norm(s).replace(/ /g, "-");

// ---- reference nodes -------------------------------------------------------

const PROVIDERS = ["Aristocrat", "Light & Wonder"];

const CASINOS = [
  {
    name: "Pechanga Resort Casino",
    city: "Temecula", region: "CA", country: "US",
    latitude: 33.4564921, longitude: -117.1066537,
    aliases: ["Pechanga Casino", "Pechanga"],
  },
  {
    // The creator tagged "The Resort At Summerlin" — the property's former
    // name. The coordinates and the video's own tags ("rampart casino")
    // point to Rampart Casino at JW Marriott Las Vegas.
    name: "Rampart Casino",
    city: "Las Vegas", region: "NV", country: "US",
    latitude: 36.175807, longitude: -115.290802,
    aliases: ["The Resort At Summerlin", "The Resorts at Summerlin", "Rampart"],
  },
];

const GAMES = [
  { name: "Buffalo Gold Revolution", provider: "Aristocrat", aliases: ["Buffalo Revolution"] },
];

// ---- per-video tags ----------------------------------------------------------

type WinTag = Omit<Prisma.WinUncheckedCreateInput, "playId" | "extractionRunId">;
type PlayTag = Omit<Prisma.PlayUncheckedCreateInput, "videoId" | "gameId" | "providerId" | "extractionRunId"> & {
  game?: string;
  provider?: string;
  wins?: WinTag[];
};
type VideoTag = {
  youtubeVideoId: string;
  venue?: { casino: string; raw: string; confidence: number };
  recordedOn?: { date: string; confidence: number; why: string };
  plays: PlayTag[];
  toCheck: string[]; // what a person must confirm while watching
};

const VIDEOS: VideoTag[] = [
  {
    youtubeVideoId: "iRWv5jBV8L8", // LuckySnoop888 — Sunday live, part 2
    recordedOn: {
      date: "2026-07-12", confidence: 0.95,
      why: "Live broadcast 2026-07-12 13:02–14:55 UTC (morning, US time); a Sunday, matching the title.",
    },
    plays: [],
    toCheck: [
      "Which casino? Nothing in the title/description/tags says.",
      "Every game played (start time, bet) and any notable wins — the description mentions Dragon Link, Buffalo Ultimate Stampede, Ultimate Fire Link as favorites, but not what was played here.",
    ],
  },
  {
    youtubeVideoId: "wmp61xfzZCE", // NE SLOTS — Unicow $15 bet
    plays: [
      {
        rawGameName: "Unicow", // exact title not yet resolved to a Game
        betAmount: 15, denomination: "MID",
        source: "AI", confidence: 0.9,
        wins: [
          {
            kind: "BONUS", isHandpay: true, size: "UNKNOWN",
            source: "AI", confidence: 0.85,
          },
        ],
      },
    ],
    toCheck: [
      "Exact game title and maker (thumbnail: UFO/cow theme; feature called 'Unicow').",
      "Final bonus amount. YouTube's auto-chapters run 'Reaching ten thousand' → 'Pushing past thirteen thousand', so likely ~$13,000 (~870×, epic) — but could be credits. Final total reveal ≈ 53:31.",
      "Casino and recording date (tags only say 'Las Vegas slots').",
    ],
  },
  {
    youtubeVideoId: "dJhJLyV7aoM", // HLS Slots — live
    recordedOn: {
      date: "2026-07-11", confidence: 0.85,
      why: "Live broadcast 2026-07-12 03:42–04:40 UTC = evening of July 11 in Pacific time (channel tags: Vegas, Laughlin).",
    },
    plays: [
      { rawGameName: "Lightning Link", provider: "Aristocrat", startSec: 1131, source: "AI", confidence: 0.6 },
      { rawGameName: "Huff N' Puff", provider: "Light & Wonder", startSec: 1378, source: "AI", confidence: 0.6 },
      { rawGameName: "Monopoly", startSec: 2049, source: "AI", confidence: 0.6 },
      { rawGameName: "Buffalo", provider: "Aristocrat", startSec: 2772, source: "AI", confidence: 0.6 },
    ],
    toCheck: [
      "Casino (tags mention both Vegas and Laughlin).",
      "Games before 18:51 (auto-chapters: 'Moving to a new game' 4:46, 'High-stakes bonus round' 8:35, 'Playing various machines' 12:37).",
      "Exact titles for the 4 chapter games above, bets (high-limit channel), and the bonus wins incl. 'Final bonus' ≈ 50:36.",
    ],
  },
  {
    youtubeVideoId: "fAABXRz629M", // Wrauberto — Buffalo Gold Revolution
    venue: { casino: "Pechanga Resort Casino", raw: "Pechanga Resort Casino", confidence: 0.95 },
    plays: [
      {
        game: "Buffalo Gold Revolution", rawGameName: "Buffalo Gold Revolution",
        startSec: 0, endSec: 1250, source: "AI", confidence: 0.95,
        wins: [
          { atSec: 135, kind: "FREE_SPINS", source: "AI", confidence: 0.6 },
          { atSec: 287, kind: "BASE_GAME", source: "AI", confidence: 0.5 },
          { atSec: 462, kind: "FREE_SPINS", source: "AI", confidence: 0.6 },
        ],
      },
    ],
    toCheck: [
      "Bet amount and denomination (thumbnail shows 'Bet multiplier 2').",
      "Amounts for the bonuses at ~2:15 and ~7:42 and the line hit at ~4:47.",
      "Recording date (not in the metadata).",
    ],
  },
  {
    youtubeVideoId: "B7ltdMq7vA0", // Adventures In Vegas — Yo Yeti short
    venue: { casino: "Rampart Casino", raw: "The Resort At Summerlin", confidence: 0.85 },
    plays: [
      {
        rawGameName: "Yo Yeti",
        betAmount: 5, betCredits: 100, creditValue: 0.05, denomination: "MID",
        startSec: 0, endSec: 113, source: "AI", confidence: 0.9,
        wins: [
          // Thumbnail: bonus at 4,300 credits ($215, 43×) with 6 spins left —
          // a lower bound, not the final amount, so amount stays empty.
          { kind: "BONUS", size: "UNKNOWN", source: "AI", confidence: 0.85 },
        ],
      },
    ],
    toCheck: [
      "Final bonus amount (thumbnail shows 4,300 credits = $215 with 6 spins still left).",
      "Game maker.",
      "Confirm Rampart Casino (creator tagged 'The Resort At Summerlin', its former name).",
      "Recording date (not in the metadata).",
    ],
  },
];

// ---- apply -------------------------------------------------------------------

async function fetchYouTube(ids: string[]) {
  if (!YT_KEY) throw new Error("YOUTUBE_API_KEY missing from .env.local");
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids.join(",")}&key=${YT_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`YouTube API: ${json.error.message}`);
  return new Map<string, { description: string; tags: string[]; channelId: string }>(
    json.items.map((v: { id: string; snippet: { description?: string; tags?: string[]; channelId: string } }) => [
      v.id,
      { description: v.snippet.description ?? "", tags: v.snippet.tags ?? [], channelId: v.snippet.channelId },
    ]),
  );
}

async function upsertAlias(entityType: "GAME" | "PROVIDER" | "CASINO", entityId: string, alias: string) {
  await db.alias.upsert({
    where: { entityType_normalized: { entityType, normalized: norm(alias) } },
    create: { entityType, entityId, alias, normalized: norm(alias) },
    update: { entityId, alias },
  });
}

async function main() {
  const providerIds = new Map<string, string>();
  for (const name of PROVIDERS) {
    const p = await db.gameProvider.upsert({ where: { slug: slugify(name) }, create: { name, slug: slugify(name) }, update: {} });
    providerIds.set(name, p.id);
  }

  const casinoIds = new Map<string, string>();
  for (const { aliases, ...c } of CASINOS) {
    const row = await db.casino.upsert({
      where: { slug: slugify(c.name) },
      create: { ...c, slug: slugify(c.name), type: "LAND_BASED" },
      update: c,
    });
    casinoIds.set(c.name, row.id);
    for (const a of [c.name, ...aliases]) await upsertAlias("CASINO", row.id, a);
  }

  const gameIds = new Map<string, string>();
  for (const g of GAMES) {
    const providerId = providerIds.get(g.provider)!;
    const row = await db.game.upsert({
      where: { slug: slugify(g.name) },
      create: { name: g.name, slug: slugify(g.name), gameType: "SLOTS", providerId },
      update: { providerId },
    });
    gameIds.set(g.name, row.id);
    for (const a of [g.name, ...g.aliases]) await upsertAlias("GAME", row.id, a);
  }

  const yt = await fetchYouTube(VIDEOS.map((v) => v.youtubeVideoId));

  for (const tag of VIDEOS) {
    const video = await db.videoEmbed.findUnique({ where: { youtubeVideoId: tag.youtubeVideoId } });
    if (!video) { console.log(`skip ${tag.youtubeVideoId}: not in this database`); continue; }
    const meta = yt.get(tag.youtubeVideoId);

    await db.$transaction(async (tx) => {
      // Clear this script's previous output for the video.
      const old = await tx.extractionRun.findMany({
        where: { videoId: video.id, model: RUN_MODEL, promptVersion: RUN_PROMPT }, select: { id: true },
      });
      const oldIds = old.map((r) => r.id);
      await tx.play.deleteMany({ where: { extractionRunId: { in: oldIds } } });
      await tx.extractionRun.deleteMany({ where: { id: { in: oldIds } } });

      const run = await tx.extractionRun.create({
        data: {
          videoId: video.id, model: RUN_MODEL, promptVersion: RUN_PROMPT,
          inputs: ["TEXT", "THUMBNAILS"],
          output: JSON.parse(JSON.stringify(tag)),
        },
      });

      for (const { game, provider, wins = [], ...play } of tag.plays) {
        const gameId = game ? gameIds.get(game)! : null;
        const created = await tx.play.create({
          data: {
            ...play, videoId: video.id, extractionRunId: run.id, gameId,
            providerId: provider ? providerIds.get(provider)! : null,
          },
        });
        for (const w of wins) {
          await tx.win.create({ data: { ...w, playId: created.id, extractionRunId: run.id } });
        }
      }

      if (meta && video.creatorId) {
        await tx.creator.update({ where: { id: video.creatorId }, data: { youtubeChannelId: meta.channelId } });
      }

      await tx.videoEmbed.update({
        where: { id: video.id },
        data: {
          ...(meta ? { description: meta.description, tags: meta.tags } : {}),
          ...(tag.venue
            ? {
                venueId: casinoIds.get(tag.venue.casino)!, rawVenueName: tag.venue.raw,
                venueSource: "YOUTUBE_API", venueConfidence: tag.venue.confidence,
              }
            : {}),
          ...(tag.recordedOn
            ? {
                recordedOn: new Date(`${tag.recordedOn.date}T12:00:00Z`), recordedOnPrecision: "DAY",
                recordedOnSource: "YOUTUBE_API",
              }
            : {}),
          staffNotes: ["Gold set v0 — to check while watching:", ...tag.toCheck.map((t) => `• ${t}`)].join("\n"),
        },
      });
    });

    const wins = tag.plays.reduce((n, p) => n + (p.wins?.length ?? 0), 0);
    console.log(`${tag.youtubeVideoId}: ${tag.plays.length} plays, ${wins} wins` +
      `${tag.venue ? `, venue ${tag.venue.casino}` : ""}${tag.recordedOn ? `, recorded ${tag.recordedOn.date}` : ""}`);
  }
}

main().finally(() => db.$disconnect());
