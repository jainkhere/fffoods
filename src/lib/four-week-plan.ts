import type { Recipe } from "@/lib/recipes";
import { sortRecipesByMealType } from "@/lib/recipes";

export const FOUR_WEEK_PLAN: Record<number, Record<number, string[]>> = {
  1: {
    1: [
      "super-seedy-breakfast-porridge",
      "the-daily-salad",
      "plant-powered-polenta-ragu",
    ],
    2: [
      "creamy-coconut-pudding-with-pineapple",
      "wild-biome-super-soup",
      "tempeh-tacos-and-taco-salad",
    ],
    3: [
      "superfood-smoothie-with-bowl-option",
      "berry-good-sweet-potato-toast",
      "muhammara-sandwich",
      "nourishing-tomato-noodle-soup",
    ],
    4: [
      "super-seedy-breakfast-porridge", 
      "tempeh-tacos-and-taco-salad", 
      "pesto-pasta"
    ],
    5: [
      "berry-good-sweet-potato-toast",
      "the-daily-salad",
      "back-pocket-stir-fry"
    ],
    6: [
      "superfood-smoothie-with-bowl-option",
      "down-n-dirty-kale-salad", 
      "curry-tofu-pak-choi"
    ],
    7: [
      "gluten-free-pancakes",
      "back-pocket-stir-fry",
      "mushroom-risotto",
    ],
  },
  2: {},
  3: {},
  4: {},
};

export function getRecipeIdsForPlanDay(week: number, day: number): string[] {
  return FOUR_WEEK_PLAN[week]?.[day] ?? [];
}

export function getRecipesForPlanDay(recipes: Recipe[], week: number, day: number): Recipe[] {
  const recipeIds = getRecipeIdsForPlanDay(week, day);
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  return sortRecipesByMealType(
    recipeIds
      .map((recipeId) => byId.get(recipeId))
      .filter((recipe): recipe is Recipe => Boolean(recipe)),
  );
}
