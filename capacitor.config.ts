import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7f37109553ba4b3daeefa9fdb0f410f8',
  appName: 'diet-validation-app',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: "https://7f371095-53ba-4b3d-aeef-a9fdb0f410f8.lovableproject.com?forceHideBadge=true",
    cleartext: true
  }
};

export default config;