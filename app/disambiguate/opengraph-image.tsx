import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const alt = "Stage 02 — Disambiguate · The Authority Arc";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "§ 02 of 05 — Stage Two · Disambiguate",
    title: "Which Stephen King?",
    emphasis: "Which",
  });
}
