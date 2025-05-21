import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

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

  twoDAnimationsSection: defineTable({
    title: v.string(),
    description: v.string(),
    updatedAt: v.number(),
  }),

  twoDAnimationsProjects: defineTable({
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    videoUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),

  threeDAnimationsSection: defineTable({
    title: v.string(),
    description: v.string(),
    updatedAt: v.number(),
  }),

  threeDAnimationsProjects: defineTable({
    title: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    videoUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),

  musicSection: defineTable({
    title: v.string(),
    description: v.string(),
    updatedAt: v.number(),
  }),

  musicTracks: defineTable({
    title: v.string(),
    duration: v.string(),
    category: v.string(),
    coverArt: v.string(),
    audioUrl: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),

  contactDetails: defineTable({
    email: v.string(),
    phone: v.string(),
    location: v.string(),
    updatedAt: v.number(),
  }),

  socialMedia: defineTable({
    platform: v.string(),
    icon: v.string(),
    url: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_updatedAt", ["updatedAt"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    service: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  newsletter: defineTable({
    email: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  settings: defineTable({
    websiteName: v.string(),
    logoUrl: v.string(),
    primaryColor: v.string(),
    sectionVisibility: v.object({
      videoEditing: v.boolean(),
      twoDAnimations: v.boolean(),
      threeDAnimations: v.boolean(),
      music: v.boolean(),
    }),
    updatedAt: v.number(),
  }),

  admins: defineTable({
    username: v.string(),
    password: v.string(),
    createdAt: v.number(),
  }).index("by_username", ["username"]),
});
