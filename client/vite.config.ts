import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // or "0.0.0.0" // allow access from Docker container
    port: 5173,
    allowedHosts: true,
    watch: {
      usePolling: true, // enables hot reload inside Docker
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    modulePreload: {
      resolveDependencies(_filename, deps) {
        // Prevent preloading heavy non-critical vendors on initial page load
        return deps.filter(
          (dep) =>
            !dep.includes("markdown-vendor") &&
            !dep.includes("recharts-vendor")
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/[\\/]node_modules[\\/](@uiw|@codemirror|codemirror)[\\/]/.test(id)) {
              return "markdown-vendor";
            }
            if (/[\\/]node_modules[\\/](recharts|d3-[^\\/]+)[\\/]/.test(id)) {
              return "recharts-vendor";
            }
            if (/[\\/]node_modules[\\/](@reduxjs|redux|redux-persist)[\\/]/.test(id)) {
              return "redux-vendor";
            }
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) {
              return "react-core";
            }
            if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) {
              return "icons-vendor";
            }
            if (/[\\/]node_modules[\\/]@radix-ui[\\/]/.test(id)) {
              return "radix-vendor";
            }
          }
        },
      },
    },
  },
});
