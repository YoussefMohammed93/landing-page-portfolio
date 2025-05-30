/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as contact from "../contact.js";
import type * as files from "../files.js";
import type * as hero from "../hero.js";
import type * as music from "../music.js";
import type * as settings from "../settings.js";
import type * as threeDAnimations from "../threeDAnimations.js";
import type * as twoDAnimations from "../twoDAnimations.js";
import type * as video from "../video.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  contact: typeof contact;
  files: typeof files;
  hero: typeof hero;
  music: typeof music;
  settings: typeof settings;
  threeDAnimations: typeof threeDAnimations;
  twoDAnimations: typeof twoDAnimations;
  video: typeof video;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
