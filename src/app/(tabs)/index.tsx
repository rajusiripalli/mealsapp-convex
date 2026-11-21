import { MEAL_CATEGORIES } from "@/constants/categories";
import { COLORS, SHADOWS } from "@/constants/theme";
import { showMealSavedNotification } from "@/lib/notifications";
import { getMealsByCategory, searchMealsByName } from "@/services/mealApi";
import { useAppStore } from "@/store/useAppStore";
import { MealListItem } from "@/types/meal";
import { useAuth } from "@clerk/expo";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronLeft, Search } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../../convex/_generated/api";

export default function DiscoverScreen() {
  const [selectedCategory, setSelectedCategory] = useState("Chicken");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<MealListItem[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated, isLoading: isConvexAuthLoading } = useConvexAuth();

  const { setPendingAuthAction } = useAppStore((state) => state);

  const saveMeal = useMutation(api.savedMeals.saveMeal);
  const savedMeals = useQuery(
    api.savedMeals.getSavedMeals,
    isLoaded && isSignedIn && isAuthenticated ? {} : "skip",
  );

  const savedMealIds = useMemo(
    () => new Set(savedMeals?.map((meal) => meal.mealId) ?? []),
    [savedMeals],
  );

  const isSearching = searchQuery.trim().length > 0;

  const loadMeals = useCallback(async (category: string) => {
    setLoading(true);
    const data = await getMealsByCategory(category).catch(() => []);
    setMeals(data);
    setLoading(false);
  }, []);

  const runSearch = useCallback(async (query: string) => {
    setLoading(true);
    const data = await searchMealsByName(query).catch(() => []);
    setMeals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSearching) return;
    loadMeals(selectedCategory);
  }, [selectedCategory, isSearching, loadMeals]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      return;
    }

    const timer = setTimeout(() => {
      runSearch(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, runSearch]);

  const handleCategoryPress = (cat: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery("");
    setSelectedCategory(cat);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleSaveMeal = async (meal: MealListItem) => {
    if (savedMealIds.has(meal.idMeal)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!isLoaded || !isSignedIn) {
      setPendingAuthAction("save-meal");
      router.push("/(auth)/sign-in");
      return;
    }

    if (isConvexAuthLoading || !isAuthenticated) {
      Alert.alert(
        "connecting account",
        "your session is still loading, please wait",
      );

      return;
    }

    try {
      setSavingId(meal.idMeal);
      const result = await saveMeal({
        mealId: meal.idMeal,
        name: meal.strMeal,
        category: meal.strCategory ?? selectedCategory,
        area: meal.strArea,
        imageUrl: meal.strMealThumb,
        source: "api",
      });

      // we can use this result to do certain features

      if (!result.alreadySaved) {
        await showMealSavedNotification(meal.strMeal);
      }
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Could not save meal",
      );
    } finally {
      setSavingId(null);
    }
  };

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
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mt-2 text-3xl font-bold text-[#1f2933]">
          Discover Meals
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="mt-6 gap-2"
        >
          {MEAL_CATEGORIES.map((category) => {
            const isSelectedCategory = category === selectedCategory;
            return (
              <Pressable
                key={category}
                onPress={() => handleCategoryPress(category)}
                className={
                  isSelectedCategory
                    ? "rounded-full bg-[#f97316] px-5 py-2.5 active:opacity-90"
                    : "rounded-full border border-[#f3e7d8] bg-white px-5 py-2.5 active:opacity-80"
                }
                style={!isSelectedCategory ? SHADOWS.soft : undefined}
              >
                <Text
                  className={
                    isSelectedCategory
                      ? "text-sm font-semibold text-white"
                      : "text-sm font-medium text-black"
                  }
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View
          className="mt-4 flex-row items-center gap-3 rounded-2xl border border-[#f3e7d8] bg-white px-4 py-3"
          style={SHADOWS.soft}
        >
          <Search size={20} color={COLORS.muted} strokeWidth={2} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search meals by name..."
            placeholderTextColor="#9ca3af"
            className="flex-1 text-base text-black"
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
        {loading ? (
          <View className="mt-15 items-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text>
              {isSearching ? "Searching Meals..." : "Loading Meals..."}
            </Text>
          </View>
        ) : null}

        {!loading && meals.length === 0 ? (
          <View
            className="mt-8 items-center rounded-3xl bg-white p-6"
            style={SHADOWS.soft}
          >
            <Text className="text-lg font-bold text-[#1f2933]">
              No meals found
            </Text>
          </View>
        ) : null}

        {!loading && meals.length > 0 ? (
          <View className="mt-6 gap-4">
            {meals.map((meal) => {
              const isSaved = savedMealIds.has(meal.idMeal);
              const isSaving = savingId === meal.idMeal;

              return (
                <View
                  key={meal.idMeal}
                  className="overflow-hidden rounded-3xl bg-white"
                  style={SHADOWS.soft}
                >
                  <Image
                    source={{ uri: meal.strMealThumb }}
                    style={{ width: "100%", height: 200 }}
                    contentFit="cover"
                    transition={200}
                  />
                  <View className="p-5">
                    <View className="self-start rounded-full bg-[#ffedd5] px-3 py-1">
                      <Text className="text-xs font-semibold text-[#f97316]">
                        {meal.strCategory ?? selectedCategory}
                      </Text>
                    </View>

                    <Text
                      className="mt-2 text-lg font-bold text-black"
                      numberOfLines={2}
                    >
                      {meal.strMeal}
                    </Text>
                    <Pressable
                      onPress={() => handleSaveMeal(meal)}
                      disabled={
                        isSaved ||
                        isSaving ||
                        (isSignedIn &&
                          (isConvexAuthLoading || !isAuthenticated))
                      }
                      className={`mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-3 active:opacity-85 
                        ${isSaved ? "bg-[#22c55e]" : "bg-[#f97316]"}
                        `}
                    >
                      <Text className="text-sm font-bold text-white">
                        {isSaved
                          ? "Saved"
                          : isSaving
                            ? "Saving..."
                            : isSignedIn &&
                                (isConvexAuthLoading || !isAuthenticated)
                              ? "Connecting..."
                              : "Save Meal"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
