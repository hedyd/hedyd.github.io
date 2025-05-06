// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://hedyd.github.io",
  integrations: [react()],
});
