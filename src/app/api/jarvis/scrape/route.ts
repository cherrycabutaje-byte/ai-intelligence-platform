import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, platform } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Build the fetch URL based on platform
    let fetchUrl = url;

    // For YouTube - convert any format to full URL
    if (platform === "YouTube" || url.includes("youtube") || url.includes("youtu.be")) {
      // If it's a short URL, convert to full
      if (url.includes("youtu.be")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        fetchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    // Fetch the page
    const response = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch URL: ${response.status}`,
        scraped_data: null 
      }, { status: 200 });
    }

    const html = await response.text();

    // Extract metadata from HTML
    const scraped_data = extractMetadata(html, url, platform);

    return NextResponse.json({ 
      success: true, 
      scraped_data 
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Don't fail hard — return empty data so Jarvis still runs
    return NextResponse.json({ 
      success: false, 
      error: message,
      scraped_data: null 
    }, { status: 200 });
  }
}

function extractMetadata(html: string, url: string, platform?: string) {
  const data: Record<string, string | null> = {};

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  data.title = titleMatch ? titleMatch[1].trim() : null;

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) 
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  data.description = descMatch ? descMatch[1].trim() : null;

  // Extract OG title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  data.og_title = ogTitleMatch ? ogTitleMatch[1].trim() : null;

  // Extract OG description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  data.og_description = ogDescMatch ? ogDescMatch[1].trim() : null;

  // Extract OG image
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  data.og_image = ogImageMatch ? ogImageMatch[1].trim() : null;

  // Extract keywords
  const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']keywords["']/i);
  data.keywords = keywordsMatch ? keywordsMatch[1].trim() : null;

  // YouTube specific
  if (platform === "YouTube" || url.includes("youtube") || url.includes("youtu.be")) {
    // Extract subscriber count if visible
    const subsMatch = html.match(/(\d+(?:\.\d+)?[KMB]?\s*subscribers)/i);
    data.subscribers = subsMatch ? subsMatch[1] : null;

    // Extract view count
    const viewsMatch = html.match(/(\d+(?:,\d+)*)\s*views/i);
    data.views = viewsMatch ? viewsMatch[1] : null;

    // Extract channel name
    const channelMatch = html.match(/"channelName":"([^"]+)"/i)
      || html.match(/"author":"([^"]+)"/i);
    data.channel_name = channelMatch ? channelMatch[1] : null;

    // Extract video count
    const videoCountMatch = html.match(/(\d+)\s*videos/i);
    data.video_count = videoCountMatch ? videoCountMatch[1] : null;
  }

  // Etsy specific
  if (platform === "Etsy" || url.includes("etsy.com")) {
    const salesMatch = html.match(/(\d+(?:,\d+)*)\s*sales/i);
    data.sales = salesMatch ? salesMatch[1] : null;

    const reviewsMatch = html.match(/(\d+(?:,\d+)*)\s*reviews/i);
    data.reviews = reviewsMatch ? reviewsMatch[1] : null;
  }

  // Amazon specific
  if (platform === "Amazon" || url.includes("amazon.com")) {
    const ratingMatch = html.match(/(\d+(?:\.\d+)?)\s*out of\s*5\s*stars/i);
    data.rating = ratingMatch ? ratingMatch[1] : null;

    const reviewCountMatch = html.match(/(\d+(?:,\d+)*)\s*(?:global\s+)?ratings/i);
    data.review_count = reviewCountMatch ? reviewCountMatch[1] : null;
  }

  // Shopify specific
  if (platform === "Shopify" || url.includes("myshopify.com")) {
    const productMatch = html.match(/"product_type":"([^"]+)"/i);
    data.product_type = productMatch ? productMatch[1] : null;
  }

  data.url = url;
  data.platform = platform ?? null;

  return data;
}