// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  runtimeConfig: {
    public: {
      GQL_HOST: "https://admin.koralbarber.com.ua/graphql",
    },
  },
  ssr: false,
  nitro: {
    preset: "vercel",
  },
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@nuxt/image", "nuxt-graphql-client"],
  srcDir: "src/",
  alias: {
    "@": "src/",
  },
  pinia: {
    autoImports: ["defineStore", ["defineStore", "definePiniaStore"]],
    ssr: false,
  },
  css: ["~/assets/scss/index.scss"],
  app: {
    head: {
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon/favicon.ico",
        },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/favicon/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/favicon/site.webmanifest" },
      ],
    },
  },
  googleFonts: {
    families: {
      Montserrat: {
        wght: [400, 600, 800],
      },
    },
    display: "swap",
    preload: true,
  },
});
