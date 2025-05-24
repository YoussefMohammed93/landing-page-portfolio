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
  }
): string {
  // If the URL is already an embed URL, return it
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  // Extract the video ID
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return "";

  // Default options
  const {
    isSafari = typeof navigator !== "undefined" &&
      /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isMobile = typeof navigator !== "undefined" &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    autoplay = true,
    controls = true,
    enableApi = true,
    playsinline = true,
    rel = false,
  } = options || {};

  // Build the parameters
  const params = new URLSearchParams();

  if (autoplay) params.append("autoplay", "1");
  if (!rel) params.append("rel", "0");
  if (enableApi) params.append("enablejsapi", "1");
  if (controls) params.append("controls", "1");

  // Safari-specific optimizations
  const isMobileSafari = isSafari && isMobile;

  // For Safari mobile, ensure playsinline is enabled to prevent fullscreen takeover
  if (isMobileSafari && playsinline) {
    params.append("playsinline", "1");
  }

  // Build the final URL
  const paramString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${paramString ? `?${paramString}` : ""}`;
}
