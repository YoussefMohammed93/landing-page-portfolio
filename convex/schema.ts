import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  hero: defineTable({
    mainHeading: v.string(),
    highlightedText: v.string(),
    description: v.string(),
    achievements: v.array(v.string()),
    imageUrl: v.string(),
    updatedAt: v.number(),
  }),

  videoSection: defineTable({
    title: v.string(),
    description: v.string(),
    updatedAt: v.number(),
  }),

  videoProjects: defineTable({
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    videoUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),
});
