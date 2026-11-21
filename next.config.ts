import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false, // dev rejimidagi "N" belgisi skrinshotlarda ko'rinmasin
  /* config options here */
  // Serverga yuklash uchun: mustaqil (standalone) build
  output: "standalone",
  images: { unoptimized: true },
  // Huquqiy yordamchi moddalar indeksini fayldan o'qiydi: standalone build ichiga qo'shiladi
  outputFileTracingIncludes: { "/api/lex-ask": ["./content/lex-index.json"] }, // Linux serverda sharp kerak bo'lmasligi uchun
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
