/**
 * Extracts the YouTube video ID from various YouTube URL formats
 * @param url YouTube URL in any format (youtube.com/watch?v=ID, youtu.be/ID, etc.)
 * @returns The video ID or null if not found
 */
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Handle various YouTube URL formats
  let videoId = null;

  // Format: youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([^&]+)/i);
  if (watchMatch) videoId = watchMatch[1];

  // Format: youtu.be/VIDEO_ID
  const shortMatch = url.match(/(?:youtu\.be\/)([^?&/]+)/i);
  if (shortMatch) videoId = shortMatch[1];

  // Format: youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/(?:youtube\.com\/embed\/)([^?&/]+)/i);
  if (embedMatch) videoId = embedMatch[1];

  // Standard format using the old regex as fallback
  if (!videoId) {
    const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
  }

  return videoId;
}

/**
 * Detects the current browser and device type
 * @returns Object with browser and device information
 */
export function detectBrowserAndDevice() {
  if (typeof navigator === "undefined") {
    return {
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isEdge: false,
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isMobileSafari: false,
    };
  }

  const userAgent = navigator.userAgent;

  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isChrome = /chrome/i.test(userAgent) && !/edge/i.test(userAgent);
  const isFirefox = /firefox/i.test(userAgent);
  const isEdge = /edge/i.test(userAgent);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isMobileSafari = isSafari && isMobile;

  return {
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    isMobile,
    isIOS,
    isAndroid,
    isMobileSafari,
  };
}

/**
 * Generates a YouTube embed URL optimized for the current browser
 * @param url YouTube URL in any format or a video ID
 * @param options Optional parameters for the embed URL
 * @returns The optimized YouTube embed URL
 */
export function getYouTubeEmbedUrl(
  url: string,
  options?: {
    isSafari?: boolean;
    isMobile?: boolean;
    autoplay?: boolean;
    controls?: boolean;
    enableApi?: boolean;
    playsinline?: boolean;
    rel?: boolean;
    modestbranding?: boolean;
    showinfo?: boolean;
    fs?: boolean;
    cc_load_policy?: boolean;
    iv_load_policy?: boolean;
    start?: number;
    end?: number;
  }
): string {
  // If the URL is already an embed URL, return it
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  // Extract the video ID
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return "";

  // Auto-detect browser if not provided
  const browserInfo = detectBrowserAndDevice();

  // Default options with browser-specific defaults
  const {
    isSafari = browserInfo.isSafari,
    isMobile = browserInfo.isMobile,
    autoplay = true,
    controls = true,
    enableApi = true,
    playsinline = true,
    rel = false,
    modestbranding = true,
    showinfo = false,
    fs = true,
    cc_load_policy = false,
    iv_load_policy = 3, // Hide annotations
    start,
    end,
  } = options || {};

  // Build the parameters
  const params = new URLSearchParams();

  // Core parameters
  if (autoplay) params.append("autoplay", "1");
  if (!rel) params.append("rel", "0");
  if (enableApi) params.append("enablejsapi", "1");
  if (controls) params.append("controls", "1");
  if (modestbranding) params.append("modestbranding", "1");
  if (!showinfo) params.append("showinfo", "0");
  if (fs) params.append("fs", "1");
  if (!cc_load_policy) params.append("cc_load_policy", "0");
  if (iv_load_policy) params.append("iv_load_policy", String(iv_load_policy));

  // Time parameters
  if (start !== undefined) params.append("start", String(start));
  if (end !== undefined) params.append("end", String(end));

  // Safari-specific optimizations
  const isMobileSafari = isSafari && isMobile;

  // For Safari mobile, ensure playsinline is enabled to prevent fullscreen takeover
  if (isMobileSafari && playsinline) {
    params.append("playsinline", "1");
  }

  // For Safari, add additional compatibility parameters
  if (isSafari) {
    params.append("html5", "1");
    params.append("wmode", "transparent");
  }

  // For mobile devices, optimize for performance
  if (isMobile) {
    params.append(
      "origin",
      typeof window !== "undefined" ? window.location.origin : ""
    );
  }

  // Build the final URL
  const paramString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${paramString ? `?${paramString}` : ""}`;
}

/**
 * Gets the YouTube thumbnail URL for a video
 * @param url YouTube URL or video ID
 * @param quality Thumbnail quality (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns The thumbnail URL
 */
export function getYouTubeThumbnailUrl(
  url: string,
  quality:
    | "default"
    | "mqdefault"
    | "hqdefault"
    | "sddefault"
    | "maxresdefault" = "maxresdefault"
): string {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return "";

  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Preloads a YouTube video for faster playback
 * @param url YouTube URL
 * @param options Preload options
 */
export function preloadYouTubeVideo(
  url: string,
  options?: {
    isSafari?: boolean;
    isMobile?: boolean;
    timeout?: number;
  }
): void {
  const { isSafari = false, isMobile = false, timeout = 2000 } = options || {};

  const embedUrl = getYouTubeEmbedUrl(url, {
    isSafari,
    isMobile,
    autoplay: false,
    controls: false,
  });

  if (!embedUrl) return;

  // Create a hidden iframe for preloading
  const preloadIframe = document.createElement("iframe");
  preloadIframe.style.display = "none";
  preloadIframe.style.position = "absolute";
  preloadIframe.style.left = "-9999px";
  preloadIframe.src = embedUrl;
  preloadIframe.setAttribute("data-preload", "true");

  document.body.appendChild(preloadIframe);

  // Remove the iframe after timeout
  setTimeout(() => {
    if (preloadIframe.parentNode) {
      preloadIframe.parentNode.removeChild(preloadIframe);
    }
  }, timeout);
}
