import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import vitePluginWasm from "vite-plugin-wasm";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    remixCloudflareDevProxy(),
    vitePluginWasm(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
});
