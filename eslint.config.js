import eslint from "@eslint/js";
import eslintReact from "@eslint-react/eslint-plugin";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["**/*.d.ts", "dist/**", "dist2/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@eslint-react": eslintReact,
      "@typescript-eslint": typescriptEslint,
      prettier,
      react: {
        rules: {
          "display-name": eslintReact.rules["no-missing-component-display-name"],
        },
      },
      "react-hooks": reactHooks,
    },
    settings: {
      "react-x": {
        importSource: "react",
        version: "detect",
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...eslintReact.configs["recommended-typescript"].rules,
      ...reactHooks.configs.flat.recommended.rules,
      "no-undef": "off",
      "no-unused-vars": ["error", { args: "none", vars: "all" }],
      "react-hooks/immutability": "off",
      "@eslint-react/exhaustive-deps": "off",
      "react/display-name": "error",
      "react-hooks/exhaustive-deps": "warn",
      "prettier/prettier": ["error", {}, { usePrettierrc: true }],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
];
