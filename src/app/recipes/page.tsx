import { Suspense } from "react";
import { RecipeLibraryClient } from "@/components/recipe-library-client";
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
  const recipes = shuffleRecipes(allRecipes);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero} aria-label="Recipe library">
          <Suspense fallback={null}>
            <RecipeLibraryClient
              recipes={recipes}
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
