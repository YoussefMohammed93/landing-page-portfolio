import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Default 3D animations section content
const DEFAULT_3D_ANIMATIONS_SECTION = {
  title: "3D Animations",
  description:
    "We create photorealistic 3D animations and models that transform your concepts into immersive experiences with depth, across all platforms.",
  updatedAt: Date.now(),
};

// Get 3D animations section content
export const get3DAnimationsSectionContent = query({
  handler: async (ctx) => {
    const threeDAnimationsSection = await ctx.db
      .query("threeDAnimationsSection")
      .order("desc")
      .first();

    if (!threeDAnimationsSection) {
      return DEFAULT_3D_ANIMATIONS_SECTION;
    }

    return threeDAnimationsSection;
  },
});

// Get all section titles for navigation
export const getSectionTitles = query({
  handler: async (ctx) => {
    const threeDAnimationsSection = await ctx.db
      .query("threeDAnimationsSection")
      .order("desc")
      .first();

    const threeDAnimationsTitle =
      threeDAnimationsSection?.title || DEFAULT_3D_ANIMATIONS_SECTION.title;

    return {
      "3d-animations": threeDAnimationsTitle,
    };
  },
});

// Update 3D animations section content
export const update3DAnimationsSection = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSection = await ctx.db
      .query("threeDAnimationsSection")
      .order("desc")
      .first();

    if (existingSection) {
      return await ctx.db.patch(existingSection._id, {
        title: args.title,
        description: args.description,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("threeDAnimationsSection", {
        title: args.title,
        description: args.description,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get 3D animations projects (limited to most recent 3 by default)
export const get3DAnimationsProjects = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;

    const projects = await ctx.db
      .query("threeDAnimationsProjects")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(limit);

    return projects;
  },
});

// Get all 3D animations projects for dashboard
export const getAll3DAnimationsProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("threeDAnimationsProjects")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();

    return projects;
  },
});

// Get a single 3D animation project by ID
export const get3DAnimationProject = query({
  args: {
    id: v.id("threeDAnimationsProjects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    return project;
  },
});

// Create a new 3D animation project
export const create3DAnimationProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    videoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("threeDAnimationsProjects", {
      title: args.title,
      description: args.description,
      thumbnailUrl: args.thumbnailUrl,
      videoUrl: args.videoUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing 3D animation project
export const update3DAnimationProject = mutation({
  args: {
    id: v.id("threeDAnimationsProjects"),
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

// Delete a 3D animation project
export const delete3DAnimationProject = mutation({
  args: {
    id: v.id("threeDAnimationsProjects"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Update 3D animation project thumbnail
export const update3DAnimationThumbnail = mutation({
  args: {
    id: v.id("threeDAnimationsProjects"),
    thumbnailUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      thumbnailUrl: args.thumbnailUrl,
      updatedAt: Date.now(),
    });
  },
});
