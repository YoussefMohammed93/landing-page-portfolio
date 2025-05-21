import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export type AdminValidationResult = {
  success: boolean;
  message?: string;
  admin?: {
    username: string;
  };
};

// Create a new admin user
export const createAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existingAdmin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existingAdmin) {
      return {
        success: false,
        message: "Admin with this username already exists",
      };
    }

    const adminId = await ctx.db.insert("admins", {
      username: args.username,
      password: args.password,
      createdAt: Date.now(),
    });

    return { success: true, message: "Admin created successfully", adminId };
  },
});

// Get admin by username
export const getAdminByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return admin;
  },
});

// Validate admin credentials
export const validateCredentials = query({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<AdminValidationResult> => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!admin) {
      return { success: false, message: "Admin not found" };
    }

    if (admin.password === args.password) {
      return { success: true, admin: { username: admin.username } };
    }

    return { success: false, message: "Invalid credentials" };
  },
});

// Update admin password
export const updateAdminPassword = mutation({
  args: {
    adminId: v.id("admins"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (
    ctx,
    args: {
      adminId: Id<"admins">;
      currentPassword: string;
      newPassword: string;
    }
  ) => {
    const admin = await ctx.db.get(args.adminId);

    if (!admin) {
      return { success: false, message: "Admin not found" };
    }

    if (admin.password !== args.currentPassword) {
      return { success: false, message: "Current password is incorrect" };
    }

    await ctx.db.patch(args.adminId, {
      password: args.newPassword,
    });

    return { success: true, message: "Password updated successfully" };
  },
});
