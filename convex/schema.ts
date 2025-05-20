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
});
