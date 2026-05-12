import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const alt =
  "The Authority Arc — how librarians solved identity, decades before Big Tech tried.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "A Five-Stage Arc · Introduction",
    title: "How librarians solved identity, decades before Big Tech tried.",
    emphasis: "identity",
  });
}
