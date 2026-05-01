import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

function patchWagmiConnectors(): Plugin {
  return {
    name: "patch-wagmi-connectors",
    transform(code, id) {
      // Only patch RainbowKit files that import missing connectors
      if (id.includes("@rainbow-me/rainbowkit") && code.includes('import { gemini }')) {
        return code.replace(
          /import\s*\{\s*gemini\s*\}\s*from\s*["']wagmi\/connectors["'];?/g,
          'const gemini = () => { throw new Error("gemini not available"); };'
        );
      }
      return undefined;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    patchWagmiConnectors(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
