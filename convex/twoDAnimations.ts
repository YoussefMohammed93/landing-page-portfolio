import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Default 2D animations section content
const DEFAULT_2D_ANIMATIONS_SECTION = {
  title: "2D Animations",
  description:
    "We create captivating 2D animations that bring your ideas to life with vibrant visuals and smooth motion.",
  updatedAt: Date.now(),
};

// Get 2D animations section content
export const get2DAnimationsSectionContent = query({
  handler: async (ctx) => {
    const twoDAnimationsSection = await ctx.db
      .query("twoDAnimationsSection")
      .order("desc")
      .first();

    if (!twoDAnimationsSection) {
      return DEFAULT_2D_ANIMATIONS_SECTION;
    }

    return twoDAnimationsSection;
  },
});

// Get all section titles for navigation
export const getSectionTitles = query({
  handler: async (ctx) => {
    const twoDAnimationsSection = await ctx.db
      .query("twoDAnimationsSection")
      .order("desc")
      .first();

    const twoDAnimationsTitle =
      twoDAnimationsSection?.title || DEFAULT_2D_ANIMATIONS_SECTION.title;

    return {
      "2d-animations": twoDAnimationsTitle,
    };
  },
});

// Update 2D animations section content
export const update2DAnimationsSection = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSection = await ctx.db
      .query("twoDAnimationsSection")
      .order("desc")
      .first();

    if (existingSection) {
      return await ctx.db.patch(existingSection._id, {
        title: args.title,
        description: args.description,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("twoDAnimationsSection", {
        title: args.title,
        description: args.description,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get 2D animations projects (limited to most recent 3 by default)
export const get2DAnimationsProjects = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;

    const projects = await ctx.db
      .query("twoDAnimationsProjects")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(limit);

    return projects;
  },
});

// Get all 2D animations projects for dashboard
export const getAll2DAnimationsProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("twoDAnimationsProjects")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();

    return projects;
  },
});

// Get a single 2D animation project by ID
export const get2DAnimationProject = query({
  args: {
    id: v.id("twoDAnimationsProjects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    return project;
  },
});

// Create a new 2D animation project
export const create2DAnimationProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    videoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("twoDAnimationsProjects", {
      title: args.title,
      description: args.description,
      thumbnailUrl: args.thumbnailUrl,
      videoUrl: args.videoUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing 2D animation project
export const update2DAnimationProject = mutation({
  args: {
    id: v.id("twoDAnimationsProjects"),
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    videoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    return await ctx.db.patch(id, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});

// Delete a 2D animation project
export const delete2DAnimationProject = mutation({
  args: {
    id: v.id("twoDAnimationsProjects"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Update 2D animation project thumbnail
export const update2DAnimationThumbnail = mutation({
  args: {
    id: v.id("twoDAnimationsProjects"),
    thumbnailUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      thumbnailUrl: args.thumbnailUrl,
      updatedAt: Date.now(),
    });
  },
});
