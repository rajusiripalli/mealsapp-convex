import { MealListItem, MealListResponse } from "@/types/meal";

const base_url = "https://www.themealdb.com/api/json/v1/1";

export async function getMealsByCategory(
  category: string,
): Promise<MealListItem[]> {
  try {
    const response = await fetch(
      `${base_url}/filter.php?c=${encodeURIComponent(category)}`,
    );

    if (!response.ok) {
      throw new Error("could not load meal list");
    }

    const data: MealListResponse = await response.json();

    return data?.meals ?? [];
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("could not load meal list");
  }
}

export async function searchMealsByName(
  search: string,
): Promise<MealListItem[]> {
  try {
    const response = await fetch(
      `${base_url}/search.php?s=${encodeURIComponent(search)}`,
    );

    if (!response.ok) {
      throw new Error("could not load meal list");
    }

    const data: MealListResponse = await response.json();

    return data?.meals ?? [];
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("could not load meal list");
  }
}
