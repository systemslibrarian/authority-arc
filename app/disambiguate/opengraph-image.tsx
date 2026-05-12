import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const alt = "Stage 02 — Distinguish · The Authority Arc";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "§ 02 of 05 — Stage Two · Distinguish",
    title: "Which Stephen King?",
    emphasis: "Which",
  });
}
