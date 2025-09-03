import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactHooks from "eslint-plugin-react-hooks";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Existing compatibility layer for Next.js
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Add React Hooks plugin rules
  {
    plugins: {
      "react-hooks": reactHooks,
      "@typescript-eslint": typescript,
      prettier: prettier,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error", // ✅ Enforce correct hook usage
      "react-hooks/exhaustive-deps": "warn", // 🔁 Warn on missing deps in useEffect etc.
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "prettier/prettier": "error", // Enforce Prettier formatting
    },
  },

  // Exclude generated files from Prettier formatting
  {
    files: ["src/generated/**/*.ts"],
    rules: {
      "prettier/prettier": "off", // Disable Prettier for generated files
    },
  },
];

export default eslintConfig;
