import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL!;
const convex = convexUrl
  ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
  : null;

function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  const { sessionId } = useAuth();

  return (
    <ConvexProviderWithClerk
      key={sessionId || "signed-out"}
      client={convex!}
      useAuth={useAuth}
    >
      {children}
    </ConvexProviderWithClerk>
  );
}

export default function RootLayout() {
  if (!publishableKey) {
    throw new Error("Clerk publishable key is not defined.");
  }
  if (!convexUrl || !convex) {
    throw new Error("convex url or convex client is not defined.");
  }
  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ConvexClerkProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fff8ef" },
            }}
          />
        </ConvexClerkProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
