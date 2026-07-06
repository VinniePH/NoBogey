import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.expo/**",
      "**/web-build/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        console: "readonly",
        document: "readonly",
        Intl: "readonly",
        process: "readonly",
        window: "readonly"
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ]
    }
  },
  {
    files: ["**/*.{tsx}"],
    plugins: {
      "react-hooks": reactHooks
    },
    rules: reactHooks.configs.recommended.rules
  },
  {
    files: ["**/*.config.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        module: "readonly",
        require: "readonly"
      },
      sourceType: "commonjs"
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
];
