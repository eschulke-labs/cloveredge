import { prisma } from "./prisma";
import { auth } from "./auth";
import { VideoGameType, VenueType } from "@/generated/prisma/enums";
import type { ViewerTier, VideoInfo } from "./homepage";

export type VideoSort = "newest" | "popular";

export type VideoFilters = {
  gameType?: string;
  venueType?: string;
  sort?: VideoSort;
};

export type VideoListItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  tier: "FREE" | "PAID";
  video: VideoInfo;
};

const GAME_TYPES = Object.values(VideoGameType);
const VENUE_TYPES = Object.values(VenueType);

function parseGameType(value?: string) {
  return GAME_TYPES.includes(value as VideoGameType) ? (value as VideoGameType) : undefined;
}

function parseVenueType(value?: string) {
  return VENUE_TYPES.includes(value as VenueType) ? (value as VenueType) : undefined;
}

export async function getVideos(
  filters: VideoFilters,
): Promise<{ viewerTier: ViewerTier; items: VideoListItem[] }> {
  const [session, gameType, venueType] = await Promise.all([
    auth(),
    Promise.resolve(parseGameType(filters.gameType)),
    Promise.resolve(parseVenueType(filters.venueType)),
  ]);

  const viewerTier: ViewerTier = session?.user ? session.user.tier : "ANON";

  const items = await prisma.contentItem.findMany({
    where: {
      contentType: "GAMEPLAY_VIDEO",
      publishedAt: { not: null },
      video: {
        ...(gameType ? { gameType } : {}),
        ...(venueType ? { venueType } : {}),
      },
    },
    orderBy:
      filters.sort === "popular"
        ? { video: { viewCount: "desc" } }
        : { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      tier: true,
      video: {
        select: {
          youtubeVideoId: true,
          thumbnailUrl: true,
          durationSeconds: true,
          channelTitle: true,
          gameType: true,
          venueType: true,
          sentiment: true,
        },
      },
    },
  });

  return {
    viewerTier,
    items: items
      .filter((i) => i.video !== null)
      .map((i) => ({
        slug: i.slug,
        title: i.title,
        excerpt: i.excerpt,
        tier: i.tier,
        video: i.video!,
      })),
  };
}

export const VIDEO_GAME_TYPES = GAME_TYPES;
export const VIDEO_VENUE_TYPES = VENUE_TYPES;
