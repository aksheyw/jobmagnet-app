import { defineConfig } from "vitest/config";

// Minimal config: the rate-limit lib is pure logic, so a node environment is enough.
// jsdom is available in devDeps for future component tests.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
