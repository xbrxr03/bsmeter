import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: { "@": "/home/abrar/Desktop/bsmeter-clone/src" },
  },
});
