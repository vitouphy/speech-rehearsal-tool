export default {
  target: 'static',
  // server: {
  //   host: '0.0.0.0',
  //   port: 3000
  // },
  env: {
    serverApiKey: process.env.SERVER_API_KEY,
  },
  publicRuntimeConfig: {
    axios: {
      browserBaseURL: process.env.BROWSER_BASE_URL,
    }
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'prepper',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Lato:400,700'
      },
      {
        rel: 'preconnect',
        href: "https://fonts.googleapis.com"
      },
      {
        rel: 'preconnect',
        href: "https://fonts.gstatic.com",
        crossorigin: true
      },
      {
        rel: 'stylesheet',
        href: "https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
      },
    ],
    bodyAttrs: {
      style: "background-color: #f6f6f6; font-family: 'Lato', sans-serif;",
    }
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/element-ui',
    '@/plugins/axios'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios'
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/, /^api/],
  },

  // serverMiddleware: [
  //   { path: "/api/", handler: __dirname + "/server-middleware/api.js" },
  // ],
}
