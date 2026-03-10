import { type PlatformProxy } from "wrangler";
import { setupDb } from "./app/shopify.server";

type GetLoadContextArgs = {
  request: Request;
  context: {
    cloudflare: Omit<PlatformProxy<Env>, "dispose" | "caches" | "cf"> & {
      caches: PlatformProxy<Env>["caches"] | CacheStorage;
      cf: Request["cf"];
    };
  };
};

declare module "@remix-run/cloudflare" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AppLoadContext extends ReturnType<typeof getLoadContext> {
    // This will merge the result of `getLoadContext` into the `AppLoadContext`
  }
}

export function getLoadContext({ context }: GetLoadContextArgs) {
  const env = context.cloudflare?.env;

  if (env) {
    // Sync wrangler vars to process.env so shopifyApp() can read them
    const varsToSync = [
      "SHOPIFY_API_KEY",
      "SHOPIFY_API_SECRET",
      "SHOPIFY_APP_URL",
      "SCOPES",
      "SHOP_CUSTOM_DOMAIN",
    ] as const;

    for (const key of varsToSync) {
      if ((env as any)[key] && !process.env[key]) {
        process.env[key] = (env as any)[key];
      }
    }

    // Initialize the DB
    setupDb(env);
  }

  return context;
}