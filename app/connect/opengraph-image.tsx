import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const alt = "Stage 04 — Connect · The Authority Arc";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "§ 04 of 05 — Stage Four · Connect",
    title: "What does it touch?",
    emphasis: "touch",
  });
}
