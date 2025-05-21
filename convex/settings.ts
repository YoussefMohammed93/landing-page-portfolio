import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getStorageIdFromUrl } from "./files";

// Default settings
const DEFAULT_SETTINGS = {
  websiteName: "Media Team",
  logoUrl: "/logo.png",
  primaryColor: "oklch(0.637 0.237 25.331)",
  sectionVisibility: {
    videoEditing: true,
    twoDAnimations: true,
    threeDAnimations: true,
    music: true,
  },
  updatedAt: Date.now(),
};

// Get settings
export const getSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").order("desc").first();

    if (!settings) {
      return DEFAULT_SETTINGS;
    }

    return settings;
  },
});

// Update website name
export const updateWebsiteName = mutation({
  args: {
    websiteName: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("settings")
      .order("desc")
      .first();

    if (existingSettings) {
      return await ctx.db.patch(existingSettings._id, {
        websiteName: args.websiteName,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("settings", {
        ...DEFAULT_SETTINGS,
        websiteName: args.websiteName,
        updatedAt: Date.now(),
      });
    }
  },
});

// Update logo URL
export const updateLogo = mutation({
  args: {
    logoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("settings")
      .order("desc")
      .first();

    if (existingSettings && existingSettings.logoUrl.includes("/storage/")) {
      const oldStorageId = getStorageIdFromUrl(existingSettings.logoUrl);
      if (oldStorageId) {
        await ctx.storage.delete(oldStorageId);
      }
    }

    if (existingSettings) {
      return await ctx.db.patch(existingSettings._id, {
        logoUrl: args.logoUrl,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("settings", {
        ...DEFAULT_SETTINGS,
        logoUrl: args.logoUrl,
        updatedAt: Date.now(),
      });
    }
  },
});

// Update primary color
export const updatePrimaryColor = mutation({
  args: {
    primaryColor: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("settings")
      .order("desc")
      .first();

    if (existingSettings) {
      return await ctx.db.patch(existingSettings._id, {
        primaryColor: args.primaryColor,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("settings", {
        ...DEFAULT_SETTINGS,
        primaryColor: args.primaryColor,
        updatedAt: Date.now(),
      });
    }
  },
});

// Update section visibility
export const updateSectionVisibility = mutation({
  args: {
    sectionVisibility: v.object({
      videoEditing: v.boolean(),
      twoDAnimations: v.boolean(),
      threeDAnimations: v.boolean(),
      music: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("settings")
      .order("desc")
      .first();

    if (existingSettings) {
      return await ctx.db.patch(existingSettings._id, {
        sectionVisibility: args.sectionVisibility,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("settings", {
        ...DEFAULT_SETTINGS,
        sectionVisibility: args.sectionVisibility,
        updatedAt: Date.now(),
      });
    }
  },
});

// Update all settings at once
export const updateAllSettings = mutation({
  args: {
    websiteName: v.string(),
    logoUrl: v.string(),
    primaryColor: v.string(),
    sectionVisibility: v.object({
      videoEditing: v.boolean(),
      twoDAnimations: v.boolean(),
      threeDAnimations: v.boolean(),
      music: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("settings")
      .order("desc")
      .first();

    if (
      existingSettings &&
      existingSettings.logoUrl.includes("/storage/") &&
      existingSettings.logoUrl !== args.logoUrl
    ) {
      const oldStorageId = getStorageIdFromUrl(existingSettings.logoUrl);
      if (oldStorageId) {
        await ctx.storage.delete(oldStorageId);
      }
    }

    if (existingSettings) {
      return await ctx.db.patch(existingSettings._id, {
        websiteName: args.websiteName,
        logoUrl: args.logoUrl,
        primaryColor: args.primaryColor,
        sectionVisibility: args.sectionVisibility,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("settings", {
        websiteName: args.websiteName,
        logoUrl: args.logoUrl,
        primaryColor: args.primaryColor,
        sectionVisibility: args.sectionVisibility,
        updatedAt: Date.now(),
      });
    }
  },
});
