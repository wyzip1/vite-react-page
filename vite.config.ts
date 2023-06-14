import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import packagesJSON from "./package.json";
import buildFTL, { publicPath } from "build-ftl";

const dependenciesList = Object.keys(packagesJSON.dependencies);

// https://vitejs.dev/config/
/* eslint-env node */
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        babelrc: true,
      },
    }),
    buildFTL({ ftlDir: "./dist2" }),
  ],
  optimizeDeps: {
    include: [...dependenciesList],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
    extensions: [".js", ".tsx", ".vue", ".jsx", ".ts"],
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/developmentApi": {
        target: "",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/developmentApi/, ""),
      },
    },
    open: true,
  },
  build: {
    // 启用manifest.json 文件
    manifest: true,
    rollupOptions: {
      input: {},
      output: {
        manualChunks: {
          react: ["react"],
          "react-router-dom": ["react-router-dom"],
          "react-dom": ["react-dom"],
          antd: ["antd"],
          "styled-components": ["styled-components"],
        },
      },
    },
  },
  base: mode === "development" ? "/" : publicPath,
  css: {
    preprocessorOptions: {
      less: {
        // 允许less语法链式调用
        javascriptEnabled: true,
      },
      scss: {
        // 禁止scss添加@charset: UTF-8
        charset: false,
      },
    },
    postcss: {
      plugins: [
        require("tailwindcss"),
        require("autoprefixer"),
        // 删除样式库中的@charset: UTF-8
        {
          postcssPlugin: "internal:charset-removal",
          AtRule: {
            charset: atRule => {
              if (atRule.name === "charset") {
                atRule.remove();
              }
            },
          },
        },
      ],
    },
  },
}));
