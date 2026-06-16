import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, platform } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Try YouTube API first for YouTube URLs
    if (platform === "YouTube" || url.includes("youtube") || url.includes("youtu.be")) {
      const youtubeData = await fetchYouTubeData(url);
      if (youtubeData) {
        return NextResponse.json({ success: true, scraped_data: youtubeData });
      }
    }

    // Fall back to HTML scraping for other platforms
    let fetchUrl = url;
    if (url.includes("youtu.be")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      fetchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    }

    const response = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.status}`, scraped_data: null }, { status: 200 });
    }

    const html = await response.text();
    const scraped_data = extractMetadata(html, url, platform);

    return NextResponse.json({ success: true, scraped_data });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message, scraped_data: null }, { status: 200 });
  }
}

async function fetchYouTubeData(url: string): Promise<Record<string, string | null> | null> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return null;

    // Extract video ID
    let videoId: string | null = null;
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] ?? null;
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0] ?? null;
    } else if (url.includes("youtube.com/shorts/")) {
      videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0] ?? null;
    }

    // Extract channel ID if it's a channel URL
    let channelId: string | null = null;
    if (url.includes("youtube.com/channel/")) {
      channelId = url.split("youtube.com/channel/")[1]?.split("?")[0] ?? null;
    } else if (url.includes("youtube.com/@")) {
      const handle = url.split("youtube.com/@")[1]?.split("?")[0] ?? null;
      if (handle) {
        // Search for channel by handle
        const searchRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${handle}&type=channel&key=${apiKey}`
        );
        const searchData = await searchRes.json();
        channelId = searchData.items?.[0]?.id?.channelId ?? null;
      }
    }

    const data: Record<string, string | null> = {};

    // Fetch video data
    if (videoId) {
      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
      );
      const videoData = await videoRes.json();
      const video = videoData.items?.[0];

      if (video) {
        data.title = video.snippet?.title ?? null;
        data.og_title = video.snippet?.title ?? null;
        data.description = video.snippet?.description ?? null;
        data.og_description = video.snippet?.description?.slice(0, 500) ?? null;
        data.channel_name = video.snippet?.channelTitle ?? null;
        data.channel_id = video.snippet?.channelId ?? null;
        data.views = video.statistics?.viewCount ?? null;
        data.likes = video.statistics?.likeCount ?? null;
        data.comments = video.statistics?.commentCount ?? null;
        data.tags = video.snippet?.tags?.join(", ") ?? null;
        data.category_id = video.snippet?.categoryId ?? null;
        data.published_at = video.snippet?.publishedAt ?? null;
        data.duration = video.contentDetails?.duration ?? null;
        data.og_image = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        data.video_id = videoId;

        // Also get channel data
        channelId = video.snippet?.channelId ?? null;
      }
    }

    // Fetch channel data
    if (channelId) {
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
      );
      const channelData = await channelRes.json();
      const channel = channelData.items?.[0];

      if (channel) {
        data.channel_name = data.channel_name ?? channel.snippet?.title ?? null;
        data.subscribers = channel.statistics?.subscriberCount ?? null;
        data.total_views = channel.statistics?.viewCount ?? null;
        data.video_count = channel.statistics?.videoCount ?? null;
        data.channel_description = channel.snippet?.description ?? null;
        data.channel_keywords = channel.brandingSettings?.channel?.keywords ?? null;
      }
    }

    data.url = url;
    data.platform = "YouTube";

    return Object.keys(data).length > 2 ? data : null;
  } catch {
    return null;
  }
}

function extractMetadata(html: string, url: string, platform?: string) {
  const data: Record<string, string | null> = {};

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  data.title = titleMatch ? titleMatch[1].trim() : null;

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  data.description = descMatch ? descMatch[1].trim() : null;

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  data.og_title = ogTitleMatch ? ogTitleMatch[1].trim() : null;

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  data.og_description = ogDescMatch ? ogDescMatch[1].trim() : null;

  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
  data.keywords = keywordsMatch ? keywordsMatch[1].trim() : null;

  if (platform === "Etsy" || url.includes("etsy.com")) {
    const salesMatch = html.match(/(\d+(?:,\d+)*)\s*sales/i);
    data.sales = salesMatch ? salesMatch[1] : null;
    const reviewsMatch = html.match(/(\d+(?:,\d+)*)\s*reviews/i);
    data.reviews = reviewsMatch ? reviewsMatch[1] : null;
  }

  if (platform === "Amazon" || url.includes("amazon.com")) {
    const ratingMatch = html.match(/(\d+(?:\.\d+)?)\s*out of\s*5\s*stars/i);
    data.rating = ratingMatch ? ratingMatch[1] : null;
    const reviewCountMatch = html.match(/(\d+(?:,\d+)*)\s*(?:global\s+)?ratings/i);
    data.review_count = reviewCountMatch ? reviewCountMatch[1] : null;
  }

  data.url = url;
  data.platform = platform ?? null;

  return data;
}
