import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

const { PUBLIC_SITE_URL } = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");

export default defineConfig({
  site: PUBLIC_SITE_URL || undefined,
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-sans",
      weights: [400, 500],
    },
  ],
  image: {
    domains: ["randomuser.me"],
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
