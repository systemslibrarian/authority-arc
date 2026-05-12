import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const alt = "Stage 03 — Classify · The Authority Arc";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "§ 03 of 05 — Stage Three · Classify",
    title: "Where does it sit in human knowledge?",
    emphasis: "sit",
  });
}
