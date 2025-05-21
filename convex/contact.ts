import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Default contact details
const DEFAULT_CONTACT_DETAILS = {
  email: "email@support.com",
  phone: "+20 950 306 935",
  location: "Mansoura, Egypt",
  updatedAt: Date.now(),
};

// Get contact details
export const getContactDetails = query({
  handler: async (ctx) => {
    const contactDetails = await ctx.db.query("contactDetails").first();

    if (!contactDetails) {
      return DEFAULT_CONTACT_DETAILS;
    }

    return contactDetails;
  },
});

// Update contact details
export const updateContactDetails = mutation({
  args: {
    email: v.string(),
    phone: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const existingDetails = await ctx.db.query("contactDetails").first();

    if (existingDetails) {
      return await ctx.db.patch(existingDetails._id, {
        email: args.email,
        phone: args.phone,
        location: args.location,
        updatedAt: Date.now(),
      });
    } else {
      return await ctx.db.insert("contactDetails", {
        email: args.email,
        phone: args.phone,
        location: args.location,
        updatedAt: Date.now(),
      });
    }
  },
});

// Get all social media links
export const getSocialMediaLinks = query({
  handler: async (ctx) => {
    const links = await ctx.db
      .query("socialMedia")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();

    return links;
  },
});

// Create a new social media link
export const createSocialMediaLink = mutation({
  args: {
    platform: v.string(),
    icon: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("socialMedia", {
      platform: args.platform,
      icon: args.icon,
      url: args.url,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a social media link
export const updateSocialMediaLink = mutation({
  args: {
    id: v.id("socialMedia"),
    platform: v.string(),
    icon: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      platform: args.platform,
      icon: args.icon,
      url: args.url,
      updatedAt: Date.now(),
    });
  },
});

// Delete a social media link
export const deleteSocialMediaLink = mutation({
  args: {
    id: v.id("socialMedia"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Submit a contact form message
export const submitContactForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    service: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactMessages", {
      name: args.name,
      email: args.email,
      service: args.service,
      message: args.message,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

// Get all contact messages
export const getAllContactMessages = query({
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("contactMessages")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    return messages;
  },
});

// Get a single contact message
export const getContactMessage = query({
  args: {
    id: v.id("contactMessages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    return message;
  },
});

// Mark a message as read
export const markMessageAsRead = mutation({
  args: {
    id: v.id("contactMessages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      isRead: true,
    });
  },
});

// Delete a contact message
export const deleteContactMessage = mutation({
  args: {
    id: v.id("contactMessages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Search and filter contact messages
export const searchContactMessages = query({
  args: {
    searchTerm: v.optional(v.string()),
    isRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let messages = await ctx.db
      .query("contactMessages")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    if (args.searchTerm) {
      const searchTermLower = args.searchTerm.toLowerCase();
      messages = messages.filter(
        (message) =>
          message.name.toLowerCase().includes(searchTermLower) ||
          message.email.toLowerCase().includes(searchTermLower) ||
          message.message.toLowerCase().includes(searchTermLower) ||
          message.service.toLowerCase().includes(searchTermLower)
      );
    }

    if (args.isRead !== undefined) {
      messages = messages.filter((message) => message.isRead === args.isRead);
    }

    return messages;
  },
});

// Subscribe to newsletter
export const subscribeToNewsletter = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existingSubscription = await ctx.db
      .query("newsletter")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingSubscription) {
      return {
        alreadySubscribed: true,
        subscription: existingSubscription,
      };
    }

    const newSubscription = await ctx.db.insert("newsletter", {
      email: args.email,
      isRead: false,
      createdAt: Date.now(),
    });

    return {
      alreadySubscribed: false,
      subscription: newSubscription,
    };
  },
});

// Get all newsletter subscriptions
export const getAllNewsletterSubscriptions = query({
  handler: async (ctx) => {
    const subscriptions = await ctx.db
      .query("newsletter")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    return subscriptions;
  },
});

// Search newsletter subscriptions
export const searchNewsletterSubscriptions = query({
  args: {
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let subscriptions = await ctx.db
      .query("newsletter")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    if (args.searchTerm) {
      const searchTermLower = args.searchTerm.toLowerCase();
      subscriptions = subscriptions.filter((subscription) =>
        subscription.email.toLowerCase().includes(searchTermLower)
      );
    }

    return subscriptions;
  },
});

// Delete a newsletter subscription
export const deleteNewsletterSubscription = mutation({
  args: {
    id: v.id("newsletter"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get unread message count
export const getUnreadMessageCount = query({
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("contactMessages")
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return messages.length;
  },
});

// Get unread newsletter subscription count
export const getUnreadNewsletterCount = query({
  handler: async (ctx) => {
    const subscriptions = await ctx.db
      .query("newsletter")
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    return subscriptions.length;
  },
});

// Mark all newsletter subscriptions as read
export const markAllNewsletterAsRead = mutation({
  handler: async (ctx) => {
    const unreadSubscriptions = await ctx.db
      .query("newsletter")
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const subscription of unreadSubscriptions) {
      await ctx.db.patch(subscription._id, {
        isRead: true,
      });
    }

    return unreadSubscriptions.length;
  },
});

// Mark all messages as read
export const markAllMessagesAsRead = mutation({
  handler: async (ctx) => {
    const unreadMessages = await ctx.db
      .query("contactMessages")
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const message of unreadMessages) {
      await ctx.db.patch(message._id, {
        isRead: true,
      });
    }

    return unreadMessages.length;
  },
});
