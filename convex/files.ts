import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import { action, mutation } from "./_generated/server";

// Helper function to extract storage ID from a Convex URL
export function getStorageIdFromUrl(url: string): Id<"_storage"> | null {
  try {
    const match = url.match(/\/storage\/([^/?]+)/);
    if (!match) return null;

    return match[1] as Id<"_storage">;
  } catch (error) {
    console.error("Error extracting storage ID from URL:", error);
    return null;
  }
}

// Generate a URL for uploading a file to Convex storage
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Store a file in Convex storage and return the URL
export const saveImage = action({
  args: {
    storageId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; url: string; result: unknown }> => {
    try {
      const storageId = args.storageId as Id<"_storage">;

      const url = await ctx.storage.getUrl(storageId);
      if (!url) {
        throw new ConvexError("Failed to get URL for file");
      }

      const result = await ctx.runMutation(api.hero.updateHeroImage, {
        imageUrl: url,
      });

      return { success: true, url, result };
    } catch (error) {
      console.error("Error in saveImage:", error);
      throw new ConvexError("Failed to process image");
    }
  },
});

// Delete a file from Convex storage
export const deleteFile = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    try {
      const storageId = getStorageIdFromUrl(args.url);

      if (!storageId) {
        console.warn("No valid storage ID found in URL:", args.url);
        return { success: true };
      }

      await ctx.storage.delete(storageId);

      return { success: true };
    } catch (error) {
      console.error("Error deleting file:", error);
      return { success: false };
    }
  },
});
