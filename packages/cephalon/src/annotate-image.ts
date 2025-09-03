// SPDX-License-Identifier: GPL-3.0-only
import { createCanvas, loadImage } from "canvas";

/**
 * Annotate a PNG image with a timestamp and description.
 * @param inputBuffer The original PNG buffer.
 * @param timestamp Optional time label (e.g. "t-3s").
 * @param description Optional text description.
 * @returns Annotated PNG as Buffer.
 */
export async function annotateImage(
  inputBuffer: Buffer,
  timestamp: string = "",
  description: string = "",
): Promise<Buffer> {
  const img = await loadImage(inputBuffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Setup annotation style
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, 50);

  ctx.fillStyle = "white";
  ctx.textBaseline = "top";
  ctx.fillText(timestamp, 10, 5);
  ctx.fillText(description, 10, 25);

  return canvas.toBuffer("image/png");
}
