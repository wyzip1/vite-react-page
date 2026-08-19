import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import packagesJSON from "./package.json" with { type: "json" };
import buildFTL, { publicPath } from "build-ftl";
import { viteMockServe } from "vite-plugin-mock";
import AutoImport from "unplugin-auto-import/vite";
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
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
      output: {
        manualChunks(id) {
          const packageChunks = {
            react: ["react"],
            "react-router-dom": ["react-router-dom"],
            "react-dom": ["react-dom"],
            antd: ["antd"],
            "styled-components": ["styled-components"],
          };

          const normalizedId = id.replaceAll("\\\\", "/");
          return Object.entries(packageChunks).find(([, packages]) =>
            packages.some(packageName => normalizedId.includes(`/node_modules/${packageName}/`)),
          )?.[0];
        },
      },
    },
  },
  base: ["development", "scan"].includes(mode) ? "/" : publicPath,
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
        autoprefixer,
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
