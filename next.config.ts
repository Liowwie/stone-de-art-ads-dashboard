import type { NextConfig } from "next";

// GitHub Pages serves project sites from /<repo-name>/, so JS/CSS/asset URLs
// need that prefix baked in. Only applied when explicitly building for Pages
// so local dev/preview still serve from "/".
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "stone-de-art-ads-dashboard";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isGithubPages ? `/${repoName}` : undefined,
  assetPrefix: isGithubPages ? `/${repoName}/` : undefined,
};

export default nextConfig;
