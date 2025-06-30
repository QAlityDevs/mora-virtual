const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/e2e/setup.js"],
  testMatch: ["<rootDir>/e2e/tests/**/*.test.js"],
  testTimeout: 60000,
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
  },
  // Configuración específica para E2E
  globalSetup: "<rootDir>/e2e/global-setup.js",
  globalTeardown: "<rootDir>/e2e/global-teardown.js",
  // Deshabilitar transformaciones de Next.js para archivos de prueba E2E
  transformIgnorePatterns: [
    "node_modules/(?!(selenium-webdriver)/)"
  ],
};

module.exports = createJestConfig(customJestConfig); 