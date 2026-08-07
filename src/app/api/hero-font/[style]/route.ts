import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ style: string }> },
) {
  const { style } = await params;
  const filename = style === "italic" ? "DaVinciForBalbin-Italic.ttf" : "DaVinciForBalbin-Regular.ttf";
  const font = await readFile(path.join(process.cwd(), "src", "fonts", filename));

  return new Response(font, {
    headers: {
      "Content-Type": "font/ttf",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
