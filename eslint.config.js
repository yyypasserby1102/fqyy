import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["scripts/**/*.mjs", "*.config.ts", "*.config.js", "**/*.config.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ["**/*.config.cjs"],
    languageOptions: {
      sourceType: "commonjs"
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off"
    }
  }
);
