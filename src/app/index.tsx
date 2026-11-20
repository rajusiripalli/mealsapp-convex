import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";
import { useAuth, useUser } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  ChefHat,
  Compass,
  Heart,
  LogIn,
  Sparkles,
  User,
  UtensilsCrossed,
} from "lucide-react-native";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const goToSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(auth)/sign-in");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View className="flex-row items-center justify-between px-6 pt-2">
        <View className="flex-row items-center gap-2 rounded-full bg-white px-4 py-2">
          <ChefHat size={16} color={COLORS.primary} strokeWidth={2.5} />
          <Text className="text-sm font-semibold">TasteMate</Text>
        </View>

        {isLoaded && isSignedIn ? (
          <Pressable
            style={SHADOWS.soft}
            // onPress={goToProfile}
            className="flex-row items-center gap-2 rounded-full bg-white px-3 py-2 active:opacity-75"
          >
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 28, height: 28, borderRadius: 14 }}
              />
            ) : (
              <View className="h-7 w-7 items-center justify-center rounded-full bg-[#ffedd5]">
                <User size={14} color={COLORS.primary} strokeWidth={2.5} />
              </View>
            )}
          </Pressable>
        ) : isLoaded ? (
          <Pressable
            className="flex-row items-center gap-2 rounded-full bg-white px-4 py-2 active:opacity-80"
            style={SHADOWS.soft}
            onPress={goToSignIn}
          >
            <LogIn size={15} color={COLORS.primary} strokeWidth={2.5} />
            <Text className="text-sm font-semibold">Sign In</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-10 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[42px] font-bold leading-[48px] text-black">
          Find your next{"\n"}craving
        </Text>

        <LinearGradient
          colors={["#F97316", "#FB923C", "#FDBA74"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            {
              marginTop: SPACING.lg,
              borderRadius: RADIUS.xl,
              padding: SPACING.lg,
              overflow: "hidden",
              minHeight: 220,
            },
            SHADOWS.soft,
          ]}
        >
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-white/25">
            <UtensilsCrossed size={30} color={"#ffffff"} strokeWidth={2} />
          </View>
          <Text className="text-[26px] font-bold leading-8 text-white">
            Tonight's pick awaits
          </Text>
          <Text className="mt-2 max-w-[85%] text-sm leading-5 text-white/90">
            Explore thousands of recipes from around the world.
          </Text>
          <Pressable
            //onPress={handleNavigateToDiscoverScreen}
            className="mt-5 flex-row items-center gap-2 self-start rounded-full bg-white px-5 py-3 active:opacity-90"
          >
            <Text className="text-sm font-bold text-[#f97316]">
              Explore Now
            </Text>
            <ArrowRight size={16} color={COLORS.primary} strokeWidth={2.5} />
          </Pressable>
        </LinearGradient>

        <Text className="mt-8 text-lg font-bold text-black">
          Everything you need
        </Text>
        <View className="mt-3 flex-row gap-3">
          <Pressable
            // onPress={handleNavigateToDiscoverScreen}
            className="flex-1 rounded-3xl bg-white p-4 active:opacity-90"
            style={[SHADOWS.soft, { minHeight: 200 }]}
          >
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#ffedd5]">
              <Compass size={22} color={COLORS.primary} strokeWidth={2} />
            </View>
            <Text className="mt-4 text-base font-bold text-[#1f2933]">
              Discover Meals
            </Text>
            <Text className="mt-1 text-xs leading-4 text-[#6b7280]">
              Browse categories and find your next favorite dish.
            </Text>
          </Pressable>
          <View className="flex-1 gap-3">
            <Pressable
              // onPress={handleNavigateToSavedScreen}
              className="flex-1 rounded-3xl bg-white p-4 active:opacity-90"
              style={[SHADOWS.soft, { minHeight: 200 }]}
            >
              <View className="h-9 w-9 items-center justify-center rounded-2xl bg-[#dcfce7]">
                <Heart size={18} color={COLORS.secondary} strokeWidth={2} />
              </View>
              <Text className="mt-4 text-base font-bold text-[#1f2933]">
                Saved Meals
              </Text>
              <Text className="mt-1 text-xs leading-4 text-[#6b7280]">
                {isSignedIn ? "View your saved meals" : "Sign in to save"}
              </Text>
            </Pressable>

            <View
              className="flex-1 rounded-3xl bg-white p-4"
              style={SHADOWS.soft}
            >
              <View className="h-9 w-9 items-center justify-center rounded-2xl bg-[#fef3c7]">
                <Sparkles size={18} color="#d97706" strokeWidth={2} />
              </View>
              <Text className="mt-4 text-base font-bold text-[#1f2933]">
                Surprise Me
              </Text>
              <Text className="mt-1 text-xs leading-4 text-[#6b7280]">
                Random Pick
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
