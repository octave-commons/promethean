/**
 * Web Tools - URL Following, Web Crawling, Content Extraction
 *
 * Enables cephalons to follow links, crawl web pages, and extract content.
 */

import type { ToolDependencies } from "./types.js";

/**
 * Fetch a URL and return its extracted content
 */
export async function fetchUrl(
  url: string,
  extractText: boolean = true,
  maxLength: number = 5000
): Promise<{
  toolName: string;
  success: boolean;
  result?: {
    url: string;
    title?: string;
    description?: string;
    text: string;
    contentLength: number;
    contentType: string;
    links?: Array<{ text: string; href: string }>;
  };
  error?: string;
}> {
  console.log(`[TOOL] web.fetch: Fetching ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CephalonBot/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        toolName: "web.fetch",
        success: false,
        error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    let html = await response.text();
    console.log(
      `[TOOL] web.fetch: Fetched ${html.length} bytes (${contentType})`
    );

    // Extract text content
    if (extractText && contentType.includes("text/html")) {
      const text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)[\s\S])*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)[\s\S])*<\/style>/gi, "")
        .replace(/<!--[\s\S]*?-->/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const truncated = text.slice(0, maxLength);

      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "";

      const descMatch = html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
      );
      const description = descMatch ? descMatch[1] : "";

      return {
        toolName: "web.fetch",
        success: true,
        result: {
          url,
          title,
          description,
          text: truncated,
          contentLength: html.length,
          contentType,
        },
      };
    }

    return {
      toolName: "web.fetch",
      success: true,
      result: {
        url,
        text: html.slice(0, maxLength),
        contentLength: html.length,
        contentType,
      },
    };
  } catch (error) {
    console.error(`[TOOL] web.fetch: Error:`, error);
    return {
      toolName: "web.fetch",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Search the web for content
 */
export async function searchWeb(
  query: string,
  numResults: number = 5
): Promise<{
  toolName: string;
  success: boolean;
  result?: {
    query: string;
    results: Array<{ title: string; url: string; snippet: string }>;
    totalResults: number;
  };
  error?: string;
}> {
  console.log(`[TOOL] web.search: Searching for "${query}"`);

  try {
    // Use DuckDuckGo HTML search (no API key needed)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CephalonBot/1.0)",
      },
    });

    if (!response.ok) {
      return {
        toolName: "web.search",
        success: false,
        error: `Search failed: ${response.status}`,
      };
    }

    const html = await response.text();

    const results: Array<{ title: string; url: string; snippet: string }> = [];
    const regex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;

    let count = 0;
    while ((match = regex.exec(html)) !== null && count < numResults) {
      const url = match[1];
      const title = match[2];
      results.push({
        title: title.trim(),
        url: url.replace(/&amp;/g, "&"),
        snippet: "",
      });
      count++;
    }

    console.log(`[TOOL] web.search: Found ${results.length} results`);

    return {
      toolName: "web.search",
      success: true,
      result: {
        query,
        results,
        totalResults: results.length,
      },
    };
  } catch (error) {
    console.error(`[TOOL] web.search: Error:`, error);
    return {
      toolName: "web.search",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
