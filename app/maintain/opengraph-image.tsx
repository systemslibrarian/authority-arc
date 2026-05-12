import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const alt = "Stage 05 — Maintain · The Authority Arc";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "§ 05 of 05 — Stage Five · Maintain",
    title: "Identity as stewardship.",
    emphasis: "stewardship",
  });
}
