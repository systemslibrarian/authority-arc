import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const alt = "Stage 01 — Identify · The Authority Arc";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "§ 01 of 05 — Stage One · Identify",
    title: "What is this thing, really?",
    emphasis: "thing",
  });
}
