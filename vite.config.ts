import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig(async () => {
  // Mantém o estado local do Wrangler/Miniflare dentro do projeto e sem telemetria.
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";
  process.env.WRANGLER_WRITE_LOGS ??= "false";

  // O plugin lê `wrangler.jsonc` (bindings DB e BUCKET) e `.dev.vars` (segredos locais).
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        persistState: { path: ".wrangler/state" },
      }),
    ],
  };
});
