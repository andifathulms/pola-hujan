/** @type {import('next').NextConfig} */
const repoName = "pola-hujan";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  images: { unoptimized: true },
};

module.exports = nextConfig;
