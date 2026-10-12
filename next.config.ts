import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes plain HTML to out/ and fails if anything
  // needs a server at request time (Server Actions, dynamic routes without params).
  output: "export",
};

export default nextConfig;
