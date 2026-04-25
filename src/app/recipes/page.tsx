import { RecipeLibraryClient } from "@/components/recipe-library-client";
import {
  moodOptions,
  nutritionFocusOptions,
} from "@/lib/recipe-classification";
import { getRecipes } from "@/lib/recipes";
import styles from "./page.module.css";

type RecipesPageProps = {
  searchParams: Promise<{
    q?: string;
    week?: string;
    mealType?: string;
    lowFodmap?: string;
    makeAhead?: string;
    ingredientTheme?: string;
    nutritionFocus?: string;
    mood?: string;
  }>;
};

function shuffleRecipes<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = shuffled[index];

    shuffled[index] = shuffled[randomIndex];
    shuffled[randomIndex] = current;
  }

  return shuffled;
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const {
    q = "",
    week,
    mealType,
    lowFodmap,
    makeAhead,
    ingredientTheme,
    nutritionFocus,
    mood,
  } = await searchParams;
  const query = q.trim();
  const allRecipes = await getRecipes();
  const availableWeeks = [...new Set(allRecipes.map((recipe) => recipe.week))]
    .filter((value): value is number => typeof value === "number")
    .sort((left, right) => left - right);
  const availableMealTypes = [...new Set(allRecipes.map((recipe) => recipe.mealType))].sort();
  const ingredientThemeCounts = new Map<string, number>();
  const ingredientThemeThreshold = allRecipes.length * 0.07;

  allRecipes.forEach((recipe) => {
    recipe.tags.forEach((tag) => {
      if (
        tag === "low-fodmap" ||
        tag === "make-ahead" ||
        tag.startsWith("week-") ||
        availableMealTypes.includes(tag)
      ) {
        return;
      }

      ingredientThemeCounts.set(tag, (ingredientThemeCounts.get(tag) ?? 0) + 1);
    });
  });

  const availableIngredientThemes = [...ingredientThemeCounts.entries()]
    .filter(([tag, count]) => count > ingredientThemeThreshold || tag === ingredientTheme)
    .sort((left, right) => {
      if (left[1] === right[1]) {
        return left[0].localeCompare(right[0]);
      }

      return right[1] - left[1];
    })
    .map(([tag]) => tag);
  const selectedWeek = week && /^\d+$/.test(week) ? Number(week) : undefined;
  const selectedMealType = mealType?.trim() || undefined;
  const selectedLowFodmap = lowFodmap === "true" ? true : undefined;
  const selectedMakeAhead = makeAhead === "true" ? true : undefined;
  const selectedIngredientTheme = ingredientTheme?.trim() || undefined;
  const selectedNutritionFocus = nutritionFocus?.trim() || undefined;
  const selectedMood = mood?.trim() || undefined;
  const recipes = shuffleRecipes(allRecipes);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Fibre Fueled Foods</p>
          <h1>Recipe Library</h1>
          <p className={styles.subheading}>
            Find perfect recipe for you among {allRecipes.length} recipes
          </p>
          <RecipeLibraryClient
            key={JSON.stringify({
              query,
              week: selectedWeek,
              mealType: selectedMealType,
              lowFodmap: selectedLowFodmap,
              makeAhead: selectedMakeAhead,
              ingredientTheme: selectedIngredientTheme,
              nutritionFocus: selectedNutritionFocus,
              mood: selectedMood,
            })}
            recipes={recipes}
            availableWeeks={availableWeeks}
            availableMealTypes={availableMealTypes}
            availableIngredientThemes={availableIngredientThemes}
            nutritionFocusOptions={nutritionFocusOptions}
            moodOptions={moodOptions}
            initialFilters={{
              query,
              week: selectedWeek,
              mealType: selectedMealType,
              lowFodmap: selectedLowFodmap,
              makeAhead: selectedMakeAhead,
              ingredientTheme: selectedIngredientTheme,
              nutritionFocus: selectedNutritionFocus,
              mood: selectedMood,
            }}
          />
        </section>
      </main>
    </div>
  );
}
