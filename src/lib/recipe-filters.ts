import { matchesMood, matchesNutritionFocus } from "@/lib/recipe-classification";
import type { Recipe } from "@/lib/recipes";

export type RecipeFilters = {
  query?: string;
  week?: number;
  mealType?: string;
  lowFodmap?: boolean;
  makeAhead?: boolean;
  ingredientTheme?: string;
  nutritionFocus?: string;
  mood?: string;
};

function normalizeSearchTerm(value: string) {
  return value.trim().toLowerCase();
}

export function matchesRecipeSearch(recipe: Recipe, query: string): boolean {
  const term = normalizeSearchTerm(query);

  if (!term) {
    return true;
  }

  const haystacks = [recipe.title, ...recipe.ingredients, ...recipe.tags];

  return haystacks.some((value) => value.toLowerCase().includes(term));
}

export function filterRecipes(
  recipes: Recipe[],
  {
    query = "",
    week,
    mealType,
    lowFodmap,
    makeAhead,
    ingredientTheme,
    nutritionFocus,
    mood,
  }: RecipeFilters,
): Recipe[] {
  const normalizedMealType = mealType?.trim().toLowerCase();
  const normalizedIngredientTheme = ingredientTheme?.trim().toLowerCase();

  return recipes.filter((recipe) => {
    if (!matchesRecipeSearch(recipe, query)) {
      return false;
    }

    if (typeof week === "number" && recipe.week !== week) {
      return false;
    }

    if (normalizedMealType && recipe.mealType.toLowerCase() !== normalizedMealType) {
      return false;
    }

    if (typeof lowFodmap === "boolean" && recipe.lowFodmap !== lowFodmap) {
      return false;
    }

    if (typeof makeAhead === "boolean" && recipe.tags.includes("make-ahead") !== makeAhead) {
      return false;
    }

    if (
      normalizedIngredientTheme &&
      !recipe.tags.some((tag) => tag.toLowerCase() === normalizedIngredientTheme)
    ) {
      return false;
    }

    if (!matchesNutritionFocus(recipe, nutritionFocus)) {
      return false;
    }

    if (!matchesMood(recipe, mood)) {
      return false;
    }

    return true;
  });
}
