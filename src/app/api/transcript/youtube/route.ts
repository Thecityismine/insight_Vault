import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  try {
    // Fetch captions via the YouTube transcript endpoint
    // This uses the public captions list available for most videos with auto-captions
    const timedTextUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageRes = await fetch(timedTextUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!pageRes.ok) {
      return NextResponse.json({ error: "Could not fetch YouTube page" }, { status: 502 });
    }

    const html = await pageRes.text();

    // Extract caption track URL from page source
    const captionMatch = html.match(/"captionTracks":\[.*?"baseUrl":"([^"]+)"/);
    if (!captionMatch) {
      return NextResponse.json({ transcript: null }, { status: 200 });
    }

    const captionUrl = captionMatch[1].replace(/\\u0026/g, "&");
    const captionRes = await fetch(captionUrl);
    if (!captionRes.ok) {
      return NextResponse.json({ transcript: null }, { status: 200 });
    }

    const xml = await captionRes.text();
    // Parse simple XML transcript
    const transcript = xml
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    return NextResponse.json({
      transcript,
      language: "en",
      hasTimestamps: false,
    });
  } catch (err) {
    return NextResponse.json({ transcript: null }, { status: 200 });
  }
}
