import type { Recipe } from "@/lib/recipes";

export const nutritionFocusOptions = [
  "higher-fibre",
  "higher-protein",
  "lower-carb",
  "balanced",
  "keeps-you-full",
  "gentle-on-digestion",
] as const;

export const moodOptions = [
  "light",
  "filling",
  "gut-friendly",
  "protein-forward",
  "meal-prep",
  "comfort-food",
] as const;

const nutritionFocusPriority = [
  "higher-protein",
  "higher-fibre",
  "lower-carb",
  "keeps-you-full",
  "balanced",
  "gentle-on-digestion",
] as const;

const moodPriority = [
  "meal-prep",
  "gut-friendly",
  "protein-forward",
  "comfort-food",
  "filling",
  "light",
] as const;

function hasTag(recipe: Recipe, tag: string) {
  return recipe.tags.includes(tag);
}

export function matchesNutritionFocus(recipe: Recipe, focus?: string): boolean {
  if (!focus) {
    return true;
  }

  switch (focus) {
    case "higher-fibre":
      return recipe.fibrePercent >= 70;
    case "higher-protein":
      return recipe.proteinPercent >= 70;
    case "lower-carb":
      return recipe.carbPercent <= 40;
    case "balanced": {
      const spread =
        Math.max(recipe.fibrePercent, recipe.carbPercent, recipe.proteinPercent) -
        Math.min(recipe.fibrePercent, recipe.carbPercent, recipe.proteinPercent);

      return spread <= 20;
    }
    case "keeps-you-full":
      return (
        recipe.fibrePercent >= 60 &&
        (recipe.proteinPercent >= 50 || recipe.carbPercent >= 50)
      );
    case "gentle-on-digestion":
      return recipe.lowFodmap || (recipe.carbPercent <= 40 && recipe.fibrePercent <= 60);
    default:
      return true;
  }
}

export function matchesMood(recipe: Recipe, mood?: string): boolean {
  if (!mood) {
    return true;
  }

  switch (mood) {
    case "light":
      return (
        recipe.mealType === "drinks" ||
        recipe.mealType === "side" ||
        (recipe.carbPercent <= 40 && recipe.proteinPercent <= 50)
      );
    case "filling":
      return (
        recipe.mealType === "lunch" ||
        recipe.mealType === "dinner" ||
        recipe.fibrePercent >= 60 ||
        recipe.proteinPercent >= 60
      );
    case "gut-friendly":
      return recipe.lowFodmap;
    case "protein-forward":
      return recipe.proteinPercent >= 70;
    case "meal-prep":
      return hasTag(recipe, "make-ahead");
    case "comfort-food":
      return (
        hasTag(recipe, "soup") ||
        hasTag(recipe, "pasta") ||
        hasTag(recipe, "risotto") ||
        hasTag(recipe, "curry") ||
        hasTag(recipe, "stir-fry") ||
        hasTag(recipe, "tacos") ||
        hasTag(recipe, "pancakes") ||
        hasTag(recipe, "pudding") ||
        hasTag(recipe, "porridge") ||
        hasTag(recipe, "noodles") ||
        recipe.carbPercent >= 70
      );
    default:
      return true;
  }
}

export function getPrimaryNutritionFocus(recipe: Recipe) {
  return (
    nutritionFocusPriority.find((focus) => matchesNutritionFocus(recipe, focus)) ??
    "balanced"
  );
}

export function getPrimaryMood(recipe: Recipe) {
  const fromPriority = moodPriority.find((mood) => matchesMood(recipe, mood));

  if (fromPriority) {
    return fromPriority;
  }

  return recipe.mealType === "lunch" || recipe.mealType === "dinner" ? "filling" : "light";
}
