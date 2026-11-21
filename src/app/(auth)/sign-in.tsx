import { COLORS, SHADOWS } from "@/constants/theme";
import { getClerkSSORedirectUrl } from "@/lib/auth";
import { useAppStore } from "@/store/useAppStore";
import { useAuth, useSSO } from "@clerk/expo";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();
  const { clearPendingAuthAction } = useAppStore((state) => state);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (isLoaded && isSignedIn) {
    return <Redirect href={"/"} />;
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const redirectUrl = getClerkSSORedirectUrl();

      const { createdSessionId, setActive, authSessionResult } =
        await startSSOFlow({
          strategy: "oauth_google",
          redirectUrl,
        });

      if (authSessionResult?.type === "cancel") {
        return;
      }

      if (authSessionResult?.type === "dismiss") {
        setErrorMessage("Sign-in was closed before it finished. Please try again.");
        return;
      }

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        clearPendingAuthAction();
        router.replace("/");
        return;
      }

      setErrorMessage(
        "Google sign-in returned without a session. Rebuild and open the app, then try again.",
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Google sign-in could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View className="px-4 pt-1">
        <Pressable
          onPress={handleBack}
          className="flex-row items-center gap-1 self-start rounded-full px-3 py-2 active:opacity-70"
        >
          <ChevronLeft size={22} strokeWidth={2.5} color={COLORS.text} />
          <Text className="text-base font-semibold">Back</Text>
        </Pressable>
      </View>

      <View className="flex-1 justify-center px-5 pb-7">
        <LinearGradient
          colors={["#f97316", "#fb923c", "#ffedd5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: 6,
            borderRadius: 999,
            marginBottom: 20,
          }}
        />
        <View className="rounded-3xl bg-white p-6" style={SHADOWS.soft}>
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-[#ffedd5]">
            <Ionicons
              name="restaurant-outline"
              size={28}
              color={COLORS.primary}
            />
          </View>
          <Text className="text-2xl font-bold leading-tight text-black">
            Welcome to MealApp
          </Text>
          <Text className="mt-3 text-base leading-6 text-[#6b7280]">
            Sign in with google to save your favorite meals
          </Text>

          <Pressable
            disabled={loading}
            style={SHADOWS.soft}
            className="mt-8 flex-row items-center border border-cyan-400 justify-center gap-3 rounded-2xl bg-white py-4 active:opacity-90 disabled:opacity-60"
            onPress={handleGoogleLogin}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={COLORS.primary} />
                <Text className="text-base font-medium text-black">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>
          {errorMessage ? (
            <Text className="mt-4 text-sm leading-5 text-red-600">
              {errorMessage}
            </Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
