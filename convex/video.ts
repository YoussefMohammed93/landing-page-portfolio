import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Default video section content
const DEFAULT_VIDEO_SECTION = {
  title: "Video Editing",
  description:
    "We transform raw footage into engaging stories that captivate your audience across all social media platforms.",
  updatedAt: Date.now(),
};

// Get video section content
export const getVideoSectionContent = query({
  handler: async (ctx) => {
    const videoSection = await ctx.db
      .query("videoSection")
      .order("desc")
      .first();

    if (!videoSection) {
      return DEFAULT_VIDEO_SECTION;
    }

    return videoSection;
  },
});

// Get all section titles for navigation
export const getSectionTitles = query({
  handler: async (ctx) => {
    const videoSection = await ctx.db
      .query("videoSection")
      .order("desc")
      .first();

    const videoTitle = videoSection?.title || DEFAULT_VIDEO_SECTION.title;

    return {
      "video-editing": videoTitle,
    };
  },
});

// Update video section content
export const updateVideoSection = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSection = await ctx.db
      .query("videoSection")
      .order("desc")
      .first();

    if (existingSection) {
      return await ctx.db.patch(existingSection._id, {
        title: args.title,
        description: args.description,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("videoSection", {
        title: args.title,
        description: args.description,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get video projects (limited to most recent 3 by default)
export const getVideoProjects = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 3;

    const projects = await ctx.db
      .query("videoProjects")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(limit);

    return projects;
  },
});

// Get all video projects for dashboard
export const getAllVideoProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("videoProjects")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();

    return projects;
  },
});

// Get a single video project by ID
export const getVideoProject = query({
  args: {
    id: v.id("videoProjects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    return project;
  },
});

// Create a new video project
export const createVideoProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    videoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("videoProjects", {
      title: args.title,
      description: args.description,
      thumbnailUrl: args.thumbnailUrl,
      videoUrl: args.videoUrl,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing video project
export const updateVideoProject = mutation({
  args: {
    id: v.id("videoProjects"),
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

// Delete a video project
export const deleteVideoProject = mutation({
  args: {
    id: v.id("videoProjects"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Update video project thumbnail
export const updateVideoThumbnail = mutation({
  args: {
    id: v.id("videoProjects"),
    thumbnailUrl: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      thumbnailUrl: args.thumbnailUrl,
      updatedAt: Date.now(),
    });
  },
});
