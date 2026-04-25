import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { RecipeLibraryClient } from "@/components/recipe-library-client";
import {
  moodOptions,
  nutritionFocusOptions,
} from "@/lib/recipe-classification";
import { getRecipes } from "@/lib/recipes";
import styles from "./page.module.css";

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

export default async function RecipesPage() {
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
        tag === "low-fodmap" || tag === "make-ahead" || tag.startsWith("week-") || availableMealTypes.includes(tag)
      ) {
        return;
      }

      ingredientThemeCounts.set(tag, (ingredientThemeCounts.get(tag) ?? 0) + 1);
    });
  });

  const availableIngredientThemes = [...ingredientThemeCounts.entries()]
    .filter(([, count]) => count > ingredientThemeThreshold)
    .sort((left, right) => {
      if (left[1] === right[1]) {
        return left[0].localeCompare(right[0]);
      }

        return right[1] - left[1];
      })
    .map(([tag]) => tag);
  const recipes = shuffleRecipes(allRecipes);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.heroActions}>
              <Link href="/" className={styles.homeLink}>
                Home
              </Link>
              <ThemeToggle className={styles.themeToggle} />
            </div>
          </div>
          <p className={styles.eyebrow}>Fibre Fueled Foods</p>
          <h1>Recipe Library</h1>
          <p className={styles.subheading}>
            Find perfect recipe for you among {allRecipes.length} recipes
          </p>
          <Suspense fallback={null}>
            <RecipeLibraryClient
              recipes={recipes}
              availableWeeks={availableWeeks}
              availableMealTypes={availableMealTypes}
              availableIngredientThemes={availableIngredientThemes}
              nutritionFocusOptions={nutritionFocusOptions}
              moodOptions={moodOptions}
              initialFilters={{
                query: "",
              }}
            />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
