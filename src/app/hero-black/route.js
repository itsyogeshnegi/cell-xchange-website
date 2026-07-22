import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-static";

export async function GET() {
  const image = await readFile(path.join(process.cwd(), "src", "assets", "images", "black.jpg"));

  return new Response(image, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800",
    },
  });
}
