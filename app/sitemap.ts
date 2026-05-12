import type { MetadataRoute } from "next";

const BASE = "https://authorityarc.systemslibrarian.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,             lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE}/identify`,     lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/disambiguate`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/classify`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/connect`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/maintain`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
