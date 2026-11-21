import { COLORS, SHADOWS } from "@/constants/theme";
import { showMealDeleteNotification } from "@/lib/notifications";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@clerk/expo";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Redirect, useRouter } from "expo-router";
import { ChevronLeft, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function SavedScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  const { setPendingAuthAction } = useAppStore((state) => state);

  const savedMeals = useQuery(
    api.savedMeals.getSavedMeals,
    isLoaded && isSignedIn && isAuthenticated ? {} : "skip",
  );

  const deleteMeal = useMutation(api.savedMeals.deleteMeal);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleDelete = (id: Id<"savedMeals">, name: string) => {
    Alert.alert(
      "Remove saved meal?",
      `"${name}" will be removed from your saved list`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setDeletingId(id);
              await deleteMeal({ id });
              await showMealDeleteNotification(name);
              // certain operations
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error ? error.message : "Could not save meal",
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  if (!isSignedIn) {
    return <Redirect href={"/(auth)/sign-in"} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View className="px-4 pt-1">
        <Pressable
          onPress={handleBack}
          className="flex-row items-center gap-1 self-start rounded-full px-3 py-2 active:opacity-70"
        >
          <ChevronLeft size={22} color={COLORS.text} strokeWidth={2.5} />
          <Text className="text-base font-medium text-black">Back</Text>
        </Pressable>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-2 text-3xl font-bold text-[#1f2933]">
          Saved Meals
        </Text>
        {savedMeals === undefined ? (
          <View className="mt-16 items-center">
            <ActivityIndicator size={"large"} color={COLORS.primary} />
            <Text className="mt-5 text-base font-medium text-black">
              Loading Saved meals...
            </Text>
          </View>
        ) : savedMeals.length === 0 ? (
          <View
            className="mt-10 items-center rounded-3xl bg-white p-8"
            style={SHADOWS.soft}
          >
            <Text className="mt-5 text-base font-medium text-black">
              No saved meals yet
            </Text>
          </View>
        ) : (
          <>
            <View className="mt-4 gap-4">
              {savedMeals.map((mealItem) => {
                const isDeleting = deletingId === mealItem._id;
                return (
                  <View
                    key={mealItem._id}
                    className="overflow-hidden rounded-3xl bg-white"
                  >
                    <Image
                      source={{ uri: mealItem.imageUrl }}
                      style={{ width: "100%", height: 200 }}
                      contentFit="cover"
                      transition={200}
                    />
                    <View className="p-4">
                      <View className="flex-row flex-wrap gap-2">
                        <Text className="text-xs font-semibold text-[#f97316]">
                          {mealItem.category}
                        </Text>
                      </View>
                      {mealItem?.area ? (
                        <View className="flex-row flex-wrap gap-2">
                          <Text className="text-xs font-semibold text-[#22c55e]">
                            {mealItem.area}
                          </Text>
                        </View>
                      ) : null}
                      <View className="flex-row flex-wrap gap-2">
                        <Text className="mt-2  text-lg font-bold text-black">
                          {mealItem.name}
                        </Text>
                      </View>
                      <Pressable
                        disabled={isDeleting}
                        onPress={() =>
                          handleDelete(mealItem._id, mealItem.name)
                        }
                        className="mt-4 flex-row items-center  justify-center gap-2 rounded-2xl border bg-[#22c55e] border-[#f3e7d8] py-3 active:opacity-90 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.primary}
                          />
                        ) : (
                          <>
                            <Trash2
                              size={18}
                              color={"#ffffff"}
                              strokeWidth={2}
                            />
                            <Text className="text-sm font-bold text-white">
                              Remove
                            </Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
