import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

/**
 * Downloads an image from a URL and saves it to the destination path.
 * Ensures the directory exists.
 */
export async function downloadImage(url: string, destPath: string): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(destPath);
  await fs.promises.mkdir(dir, { recursive: true });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image ${url}: ${response.statusText}`);
  }
  const buffer = await response.buffer();
  await fs.promises.writeFile(destPath, buffer);
}
