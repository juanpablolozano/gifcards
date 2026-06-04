import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: { value: "#111827" },
        secondary: { value: "#4F46E5" },
        accent: { value: "#10B981" },
        surface: { value: "#F9FAFB" },
        border: { value: "#E5E7EB" },
        textSecondary: { value: "#6B7280" },
      },
      fonts: {
        body: { value: "Inter, system-ui, sans-serif" },
        heading: { value: "Inter, system-ui, sans-serif" },
      },
      radii: {
        card: { value: "12px" },
        button: { value: "8px" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
