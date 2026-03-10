import { defineConfig, type UserConfig, type Plugin } from "vite";
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin,
} from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./load-context";

// Fix Vite 6 JSON import attributes inconsistency between @shopify/shopify-app-remix and @shopify/polaris
function fixJsonImportAttributes(): Plugin {
  return {
    name: "fix-json-import-attributes",
    hotUpdate({ modules }) {
      // no-op, just ensures consistent module handling
    },
    transform(code, id) {
      // Strip `with { type: "json" }` from imports to make them consistent
      if (id.includes("@shopify") && code.includes('with { type: "json" }')) {
        return {
          code: code.replace(/\s*with\s*\{\s*type:\s*["']json["']\s*\}/g, ""),
          map: null,
        };
      }
    },
  };
}

declare module "@remix-run/cloudflare" {
  interface Future {
    v3_singleFetch: true;
  }
}

// Handle Shopify environment variables
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost")
  .hostname;

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: parseInt(process.env.FRONTEND_PORT!) || 8002,
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    allowedHosts: [host],
    cors: {
      preflightContinue: true,
    },
    port: Number(process.env.PORT || 3000),
    hmr: hmrConfig,
    fs: {
      allow: ["app", "node_modules"],
    },
  },
  plugins: [
    fixJsonImportAttributes(),
    cloudflareDevProxyVitePlugin({
      getLoadContext,
    }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
        v3_routeConfig: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"],
    },
  },
  resolve: {
    mainFields: ["browser", "module", "main"],
  },
  build: {
    minify: true,
    assetsInlineLimit: 0,
    emptyOutDir: false,
  },
  optimizeDeps: {
    include: ["@shopify/app-bridge-react", "@shopify/polaris"],
  },
}) satisfies UserConfig;