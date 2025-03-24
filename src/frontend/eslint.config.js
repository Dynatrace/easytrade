import { defineConfig } from "eslint/config"
import globals from "globals"
import js from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"

export default defineConfig([
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
        plugins: { js },
        extends: ["js/recommended"],
    },
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    pluginReact.configs.flat.recommended,
    {
        rules: {
            "@typescript-eslint/no-deprecated": "warn",
            "@typescript-eslint/only-throw-error": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
        },
    },
    {
        settings: {
            react: {
                version: "detect", // Automatically detect the React version
            },
        },
    },
])
