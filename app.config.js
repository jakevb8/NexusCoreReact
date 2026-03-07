// Dynamic app config — replaces app.json to support EAS secret file env vars.
// GOOGLE_SERVICES_JSON is set as an EAS secret file variable so that the
// gitignored google-services.json is available during cloud builds without
// being committed to the repository.
export default {
  expo: {
    name: "NexusCoreReact",
    slug: "NexusCoreReact",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    scheme: "nexuscore-react",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "me.jakev.rn.nexuscore",
      googleServicesFile: "./GoogleService-Info.plist",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundColor: "#ffffff",
      },
      package: "me.jakev.rn.nexuscore",
      // On EAS Build, GOOGLE_SERVICES_JSON is injected as a secret file variable.
      // Locally, fall back to the gitignored file in the project root.
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "1326b8be-cdba-448c-bcd4-b0384dd56a1c",
      },
    },
    owner: "jakev.dev",
  },
};
