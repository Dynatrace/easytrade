/// <reference types="vitest" />
import { mergeConfig, defineConfig } from "vite"

import viteConfig from "./vite.config"

export default defineConfig((configEnv) =>
    mergeConfig(
        viteConfig(configEnv),
        defineConfig({
            test: {
                globals: true,
                environment: "jsdom",
                testTimeout: 10000,
            },
        })
    )
)
