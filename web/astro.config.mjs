import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://yoursite.com",
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
