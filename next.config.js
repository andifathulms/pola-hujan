/** @type {import('next').NextConfig} */
const repoName = "pola-hujan";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  images: { unoptimized: true },
  // GitHub Pages serves a route like /peta/ by looking for
  // peta/index.html, not peta.html (the static-export default). Without
  // this, every non-root route 404s once deployed.
  trailingSlash: true,
};

module.exports = nextConfig;
