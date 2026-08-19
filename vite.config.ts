import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import packagesJSON from "./package.json" with { type: "json" };
import buildFTL, { publicPath } from "build-ftl";
import { viteMockServe } from "vite-plugin-mock";
import AutoImport from "unplugin-auto-import/vite";
import MultiPageAutoPlugin from "vite-plugin-multipage-auto";
import tailwindcss from "@tailwindcss/vite";
import autoprefixer from "autoprefixer";

const dependenciesList = Object.keys(packagesJSON.dependencies);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    AutoImport({
      imports: ["react", "react-router-dom"],
      include: [/\.ts$/, /\.tsx$/, /\.md$/],
    }),
    tailwindcss(),
    MultiPageAutoPlugin(),
    buildFTL({ ftlDir: "./dist2" }),
    viteMockServe({ mockPath: "mock" }),
  ],
  optimizeDeps: {
    include: [...dependenciesList],
  },
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](?:react|react-dom)[\\/]/,
              priority: 30,
            },
            {
              name: "react-router-dom",
              test: /node_modules[\\/]react-router-dom[\\/]/,
              priority: 25,
            },
            {
              name: "antd",
              test: /node_modules[\\/]antd[\\/]/,
              maxSize: 1_200_000,
              priority: 20,
            },
            {
              name: "styled-components",
              test: /node_modules[\\/]styled-components[\\/]/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
  base: ["development", "scan"].includes(mode) ? "/" : publicPath,
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
}));
