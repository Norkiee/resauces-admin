import { NextRequest } from "next/server";
import ogs from "open-graph-scraper";


export const dynamic = "force-dynamic"; // optional: ensures fresh scraping

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing URL" }), {
      status: 400,
    });
  }

  try {
    const { result } = await ogs({ url }) as {
      result: {
        ogTitle?: string;
        ogImage?: { url?: string } | { url?: string }[];
      };
    };
    const image =
      Array.isArray(result.ogImage) ? result.ogImage[0]?.url : result.ogImage?.url;

    return new Response(
      JSON.stringify({
        title: result.ogTitle || "",
        image: image || "",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("OG scrape failed", err);
    return new Response(JSON.stringify({ error: "OG scrape failed" }), {
      status: 500,
    });
  }
}