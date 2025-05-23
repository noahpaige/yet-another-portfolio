import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactHooks from "eslint-plugin-react-hooks";

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
    },
    rules: {
      "react-hooks/rules-of-hooks": "error", // ✅ Enforce correct hook usage
      "react-hooks/exhaustive-deps": "warn", // 🔁 Warn on missing deps in useEffect etc.
    },
  },
];

export default eslintConfig;
