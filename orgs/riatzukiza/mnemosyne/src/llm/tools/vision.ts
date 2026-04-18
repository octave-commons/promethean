/**
 * Vision Tools - Image Inspection and Analysis
 *
 * Uses LLM vision capabilities to analyze images and URLs.
 */

import type { ToolDependencies } from "./types.js";

export interface VisionToolResult {
  description: string;
  labels?: string[];
  objects?: Array<{
    name: string;
    confidence: number;
    bbox?: [number, number, number, number];
  }>;
  text?: string;
  imageWidth?: number;
  imageHeight?: number;
}

/**
 * Analyze an image from a URL or attachment using ZAI GLM-4V
 */
export async function analyzeImage(
  source: string,
  detail: string = "medium",
  focus: string = "general"
): Promise<{ toolName: string; success: boolean; result?: VisionToolResult; error?: string }> {
  console.log(`[TOOL] vision.inspect: Analyzing image from ${source}`);

  try {
    // Fetch the image
    const response = await fetch(source);
    if (!response.ok) {
      return {
        toolName: "vision.inspect",
        success: false,
        error: `Failed to fetch image: ${response.status} ${response.statusText}`,
      };
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get("content-type") || "image/png";

    console.log(
      `[TOOL] vision.inspect: Image fetched (${imageBuffer.length} bytes, ${mimeType})`
    );

    // Prepare base64 image
    const base64Image = imageBuffer.toString("base64");

    // Call ZAI vision API (GLM-4V)
    const visionResponse = await fetch(
      "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "glm-4v-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: `data:${mimeType};base64,${base64Image}`,
                },
                {
                  type: "text",
                  text: `Analyze this image. Focus on ${focus}. Level of detail: ${detail}. Describe what you see, identify any objects, text, or notable features. Be concise but factual.`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      return {
        toolName: "vision.inspect",
        success: false,
        error: `Vision API error: ${visionResponse.status}`,
      };
    }

    const data = (await visionResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || "";

    return {
      toolName: "vision.inspect",
      success: true,
      result: {
        description: content,
        text: content,
      },
    };
  } catch (error) {
    console.error(`[TOOL] vision.inspect: Error:`, error);
    return {
      toolName: "vision.inspect",
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
