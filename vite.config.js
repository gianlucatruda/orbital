export default {
  root: "UI/",
  publicDir: "../static/",
  base: "./",
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    target: 'esnext',
    outDir: "../dist",
  },
  optimizeDeps: {
    exclude: ['engine'],
  },
};
