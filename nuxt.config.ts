export default defineNuxtConfig({
  compatibilityDate: "2025-06-15",

  devtools: { enabled: false },

  app: {
    head: {
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap",
        },
      ],
    },
  },

  modules: ["@nuxt/ui", "@pinia/nuxt", "pinia-plugin-persistedstate/nuxt"],

  css: ["~/assets/css/main.css", "~/assets/scss/_alert.scss"],

  colorMode: {
    preference: "light",
    fallback: "light",
    storageKey: "mcop-meeting-color-mode",
  },

  runtimeConfig: {
    public: {
      WEB_API: "",
      API_VERSION: "v0.3.2",
      RECAPTCHA_SITE_KEY: "",
      // Keycloak — ยังไม่ได้้ใช้กับ login
      KEYCLOAK_BASE_URL: "",
      KEYCLOAK_REALM: "",
      KEYCLOAK_CLIENT_ID: "",
      KEYCLOAK_IDP_HINT: "",
      KEYCLOAK_REDIRECT_PATH: "/auth/sso/callback",
    },
  },

  typescript: {
    strict: true,
  },
});


