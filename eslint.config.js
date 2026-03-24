import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "no-useless-escape": "off",
      "no-case-declarations": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".next/**",
      ".turbo/**",
      ".cache/**",
      "coverage/**",
      "*.min.js",
      "packages/**",
    ],
  },
);
