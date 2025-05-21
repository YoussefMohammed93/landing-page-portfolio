import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Default music section content
const DEFAULT_MUSIC_SECTION = {
  title: "Music",
  description:
    "Our in-house composers create custom music and sound design that enhances your visual content and creates a memorable audio experience for your audience",
  updatedAt: Date.now(),
};

// Get music section content
export const getMusicSectionContent = query({
  handler: async (ctx) => {
    const musicSection = await ctx.db
      .query("musicSection")
      .order("desc")
      .first();

    if (!musicSection) {
      return DEFAULT_MUSIC_SECTION;
    }

    return musicSection;
  },
});

// Get all section titles for navigation
export const getSectionTitles = query({
  handler: async (ctx) => {
    const musicSection = await ctx.db
      .query("musicSection")
      .order("desc")
      .first();

    const musicTitle = musicSection?.title || DEFAULT_MUSIC_SECTION.title;

    return {
      music: musicTitle,
    };
  },
});

// Update music section content
export const updateMusicSection = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSection = await ctx.db
      .query("musicSection")
      .order("desc")
      .first();

    if (existingSection) {
      return await ctx.db.patch(existingSection._id, {
        title: args.title,
        description: args.description,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("musicSection", {
        title: args.title,
        description: args.description,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get music tracks (limited to most recent 3 by default)
export const getMusicTracks = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;

    const tracks = await ctx.db
      .query("musicTracks")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(limit);

    return tracks;
  },
});

// Get all music tracks for dashboard
export const getAllMusicTracks = query({
  handler: async (ctx) => {
    const tracks = await ctx.db
      .query("musicTracks")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();

    return tracks;
  },
});

// Get a single music track by ID
export const getMusicTrack = query({
  args: {
    id: v.id("musicTracks"),
  },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.id);
    return track;
  },
});

// Create a new music track
export const createMusicTrack = mutation({
  args: {
    title: v.string(),
    duration: v.string(),
    category: v.string(),
    coverArt: v.string(),
    audioUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("musicTracks", {
      title: args.title,
      duration: args.duration,
      category: args.category,
      coverArt: args.coverArt,
      audioUrl: args.audioUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing music track
export const updateMusicTrack = mutation({
  args: {
    id: v.id("musicTracks"),
    title: v.string(),
    duration: v.string(),
    category: v.string(),
    coverArt: v.string(),
    audioUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const existingTrack = await ctx.db.get(id);
    if (!existingTrack) {
      throw new Error(`Music track with ID ${id} not found`);
    }

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete a music track
export const deleteMusicTrack = mutation({
  args: {
    id: v.id("musicTracks"),
  },
  handler: async (ctx, args) => {
    const existingTrack = await ctx.db.get(args.id);
    if (!existingTrack) {
      throw new Error(`Music track with ID ${args.id} not found`);
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Update music track cover art
export const updateMusicTrackCover = mutation({
  args: {
    id: v.id("musicTracks"),
    coverArt: v.string(),
  },
  handler: async (ctx, args) => {
    const existingTrack = await ctx.db.get(args.id);
    if (!existingTrack) {
      throw new Error(`Music track with ID ${args.id} not found`);
    }

    return await ctx.db.patch(args.id, {
      coverArt: args.coverArt,
      updatedAt: Date.now(),
    });
  },
});

// Update music track audio file
export const updateMusicTrackAudio = mutation({
  args: {
    id: v.id("musicTracks"),
    audioUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existingTrack = await ctx.db.get(args.id);
    if (!existingTrack) {
      throw new Error(`Music track with ID ${args.id} not found`);
    }

    return await ctx.db.patch(args.id, {
      audioUrl: args.audioUrl,
      updatedAt: Date.now(),
    });
  },
});
