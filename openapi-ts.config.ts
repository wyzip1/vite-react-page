import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "",
  output: {
    format: "prettier",
    lint: "eslint",
    path: "./src/api/generated",
  },
  plugins: [
    "@hey-api/schemas",
    {
      name: "@hey-api/client-axios",
      runtimeConfigPath: "../config",
    },
    {
      enums: "javascript",
      name: "@hey-api/typescript",
    },
    {
      name: "@hey-api/sdk",
    },
  ],
});
