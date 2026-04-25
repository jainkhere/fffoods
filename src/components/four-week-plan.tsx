import Link from "next/link";
import { toPascalCase } from "@/lib/format";
import { getPrimaryMood, getPrimaryNutritionFocus } from "@/lib/recipe-classification";
import type { Recipe } from "@/lib/recipes";
import { getRecipesForPlanDay } from "@/lib/four-week-plan";
import styles from "./four-week-plan.module.css";

const PRIMARY_MEAL_TYPES = new Set(["breakfast", "lunch", "dinner"]);

type FourWeekPlanProps = {
  recipes: Recipe[];
};

export function FourWeekPlan({ recipes }: FourWeekPlanProps) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Fibre Fueled Foods</p>
          <h1>Four Week Plan</h1>
          <p className={styles.summary}>
            Browse the full 28-day plan by week and day. Each day opens a
            dedicated plan view with the recipes currently assigned to that slot.
          </p>
        </section>

        <section className={styles.calendar}>
          {Array.from({ length: 4 }, (_, weekIndex) => {
            const weekNumber = weekIndex + 1;
            const weekRecipes = Array.from({ length: 7 }, (_, dayIndex) =>
              getRecipesForPlanDay(recipes, weekNumber, dayIndex + 1),
            ).flat();

            return (
              <article key={weekNumber} className={styles.weekCard}>
                <div className={styles.weekHeader}>
                  <h2>Week {weekNumber}</h2>
                  <p>
                    {weekRecipes.length} recipe{weekRecipes.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className={styles.dayGrid}>
                  <Link
                    href={`/four-week-plan/week/${weekNumber}/extras`}
                    className={styles.dayCard}
                  >
                    <div className={styles.dayTop}>
                      <span className={styles.dayLabel}>Extras</span>
                      <span className={styles.recipeCount}>
                        {
                          weekRecipes.filter(
                            (recipe) => !PRIMARY_MEAL_TYPES.has(recipe.mealType),
                          ).length
                        }
                      </span>
                    </div>

                    <div className={styles.mealList}>
                      <p className={styles.recipePreview}>
                        Sides, toppings, snacks, drinks, desserts, and other plan extras.
                      </p>
                    </div>
                  </Link>

                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayNumber = dayIndex + 1;
                    const dayRecipes = getRecipesForPlanDay(recipes, weekNumber, dayNumber);

                    return (
                      <Link
                        key={`${weekNumber}-${dayNumber}`}
                        href={`/four-week-plan/week/${weekNumber}/day/${dayNumber}`}
                        className={`${styles.dayCard} ${dayRecipes.length === 0 ? styles.dayMuted : ""}`}
                      >
                        <div className={styles.dayTop}>
                          <span className={styles.dayLabel}>Day {dayNumber}</span>
                          <span className={styles.recipeCount}>
                            {dayRecipes.length}
                          </span>
                        </div>

                        <div className={styles.mealList}>
                          {dayRecipes.length > 0 ? (
                            dayRecipes.slice(0, 3).map((recipe) => (
                              <p key={recipe.id} className={styles.recipePreview}>
                                {recipe.title}
                              </p>
                            ))
                          ) : (
                            <p className={styles.emptyText}>No recipes assigned yet.</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

type FourWeekExtrasProps = {
  recipes: Recipe[];
  week: number;
};

export function FourWeekExtras({ recipes, week }: FourWeekExtrasProps) {
  const weekRecipes = recipes.filter((recipe) => recipe.week === week);
  const extraRecipes = weekRecipes.filter((recipe) => !PRIMARY_MEAL_TYPES.has(recipe.mealType));

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Link href="/four-week-plan" className={styles.backLink}>
          Back to calendar
        </Link>

        <section className={styles.hero}>
          <div className={styles.dayPageHeader}>
            <div>
              <p className={styles.eyebrow}>Four Week Plan</p>
              <h1>Week {week} Extras</h1>
            </div>
            <p className={styles.summary}>
              {extraRecipes.length > 0
                ? `${extraRecipes.length} extra recipe${extraRecipes.length === 1 ? "" : "s"} for this week.`
                : "No extra recipes are assigned to this week yet."}
            </p>
          </div>
        </section>

        <section className={styles.recipes}>
          {extraRecipes.length > 0 ? (
            extraRecipes.map((recipe) => (
              <article key={recipe.id} className={styles.recipeCard}>
                <div className={styles.recipeMeta}>
                  <span className={styles.mealPill}>{toPascalCase(recipe.mealType)}</span>
                  <span className={styles.mealPill}>
                    {toPascalCase(getPrimaryNutritionFocus(recipe))}
                  </span>
                  <span className={styles.mealPill}>{toPascalCase(getPrimaryMood(recipe))}</span>
                </div>

                <Link href={`/recipes/${recipe.id}`} className={styles.recipeContentLink}>
                  <h2>{recipe.title}</h2>
                  <p>
                    {recipe.descriptiveNote ??
                      `${recipe.lowFodmap ? "Low FODMAP." : "Not marked low FODMAP."}`}
                  </p>
                </Link>

                <Link href={`/recipes/${recipe.id}`} className={styles.recipeLink}>
                  Open recipe
                </Link>
              </article>
            ))
          ) : (
            <article className={styles.recipeCard}>
              <h2>No extra recipes yet</h2>
              <p>This week currently has no side, topping, snack, drink, or dessert entries.</p>
            </article>
          )}
        </section>
      </main>
    </div>
  );
}

type FourWeekDayProps = {
  recipes: Recipe[];
  week: number;
  day: number;
};

export function FourWeekDay({ recipes, week, day }: FourWeekDayProps) {
  const dayRecipes = getRecipesForPlanDay(recipes, week, day);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Link href="/four-week-plan" className={styles.backLink}>
          Back to calendar
        </Link>

        <section className={styles.hero}>
          <div className={styles.dayPageHeader}>
            <div>
              <p className={styles.eyebrow}>Four Week Plan</p>
              <h1>
                Week {week}, Day {day}
              </h1>
            </div>
            <p className={styles.summary}>
              {dayRecipes.length > 0
                ? `${dayRecipes.length} recipe${dayRecipes.length === 1 ? "" : "s"} scheduled for this day.`
                : "No recipes are assigned to this day yet."}
            </p>
          </div>
        </section>

        <section className={styles.recipes}>
          {dayRecipes.length > 0 ? (
            dayRecipes.map((recipe) => (
              <article key={recipe.id} className={styles.recipeCard}>
                <div className={styles.recipeMeta}>
                  <span className={styles.mealPill}>{toPascalCase(recipe.mealType)}</span>
                  <span className={styles.mealPill}>
                    {toPascalCase(getPrimaryNutritionFocus(recipe))}
                  </span>
                  <span className={styles.mealPill}>{toPascalCase(getPrimaryMood(recipe))}</span>
                </div>

                <Link href={`/recipes/${recipe.id}`} className={styles.recipeContentLink}>
                  <h2>{recipe.title}</h2>
                  <p>
                    {recipe.descriptiveNote ??
                      `${typeof recipe.day === "number" ? `Day ${recipe.day}. ` : ""}${
                        recipe.lowFodmap ? "Low FODMAP." : "Not marked low FODMAP."
                      }`}
                  </p>
                </Link>

                <Link href={`/recipes/${recipe.id}`} className={styles.recipeLink}>
                  Open recipe
                </Link>
              </article>
            ))
          ) : (
            <article className={styles.recipeCard}>
              <h2>No recipes yet</h2>
              <p>This day is currently empty in the plan data.</p>
            </article>
          )}
        </section>
      </main>
    </div>
  );
}
