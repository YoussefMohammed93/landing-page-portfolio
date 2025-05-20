import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Default hero content
const DEFAULT_HERO_CONTENT = {
  mainHeading: "Social Media Content That Captivates",
  highlightedText: "Captivates",
  description:
    "We create stunning videos, animations, and music that help brands stand out in the crowded social media landscape.",
  achievements: [
    "50+ brands trust our creative team.",
    "100+ projects completed successfully.",
    "24/7 support for all our clients.",
  ],
  imageUrl: "/hero.svg",
  updatedAt: Date.now(),
};

// Get hero content
export const getHeroContent = query({
  handler: async (ctx) => {
    const heroContent = await ctx.db.query("hero").order("desc").first();

    if (!heroContent) {
      return DEFAULT_HERO_CONTENT;
    }

    return heroContent;
  },
});

// Update hero content text
export const updateHeroText = mutation({
  args: {
    mainHeading: v.string(),
    highlightedText: v.string(),
    description: v.string(),
    achievements: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existingHero = await ctx.db.query("hero").order("desc").first();

    if (existingHero) {
      return await ctx.db.patch(existingHero._id, {
        mainHeading: args.mainHeading,
        highlightedText: args.highlightedText,
        description: args.description,
        achievements: args.achievements,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("hero", {
        mainHeading: args.mainHeading,
        highlightedText: args.highlightedText,
        description: args.description,
        achievements: args.achievements,
        imageUrl: DEFAULT_HERO_CONTENT.imageUrl,
        updatedAt: Date.now(),
      });
    }
  },
});

// Update hero image URL
export const updateHeroImage = mutation({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existingHero = await ctx.db.query("hero").order("desc").first();

    if (existingHero) {
      return await ctx.db.patch(existingHero._id, {
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("hero", {
        ...DEFAULT_HERO_CONTENT,
        imageUrl: args.imageUrl,
        updatedAt: Date.now(),
      });
    }
  },
});
