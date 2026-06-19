"use client";

import { Fragment, useMemo, useState } from "react";
import data from "../../../data/weekly_meal_prep_seed_data.json";
import styles from "./page.module.css";

type GroceryItem = { item: string; quantity: string; use: string };
type PrepOverview = { item: string; quantity: string; used_for: string };
type PrepDay = { covers: string; theme: string; overview: PrepOverview[]; steps: string[] };
type Recipe = (typeof data.recipes)[number];

const sectionLinks = [
  ["groceries", "Grocery list"],
  ["meal-prep", "Meal prep"],
  ["weekly-menu", "Weekly menu"],
  ["recipes", "Recipes"],
] as const;

const groceryIcons: Record<string, string> = {
  "Leafy Greens, Lettuce & Fresh Herbs": "🥬",
  Vegetables: "🥕",
  Fruits: "🥝",
  "Lentils, Beans & Vegetarian Protein": "🫘",
  "Grains, Batter & Breakfast Items": "🌾",
  "Nuts, Seeds & Healthy Fats": "🌰",
  "Dairy-Free / Low-Sugar Items": "🥛",
  "Sauces, Condiments & Pantry Items": "🫙",
  Spices: "✨",
  "Optional Convenience Items": "⏱️",
  "Avoid Buying": "✋",
};

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function ingredientPairs(value: unknown): [string, string][] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): [string, string][] => {
    if (Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string") {
      return [[entry[0], entry[1]]];
    }

    if (entry && typeof entry === "object" && "item" in entry && "quantity" in entry) {
      const item = (entry as { item: unknown }).item;
      const quantity = (entry as { quantity: unknown }).quantity;
      return typeof item === "string" && typeof quantity === "string" ? [[item, quantity]] : [];
    }

    return [];
  });
}

function recipesForMeal(meal: string, recipes: Recipe[]) {
  const matches = recipes.filter((recipe) => meal.toLowerCase().includes(recipe.name.toLowerCase()));
  const add = (name: string) => {
    const recipe = recipes.find((candidate) => candidate.name === name);
    if (recipe && !matches.includes(recipe)) matches.push(recipe);
  };

  if (/idli.*sambar/i.test(meal)) add("Idli with Sambar and Coconut Chutney");
  if (/overnight oats/i.test(meal)) {
    add(/kiwi/i.test(meal) ? "Overnight Oats with Kiwi, Chia & Flaxseed" : "Overnight Oats with Berries, Chia & Flaxseed");
  }
  if (/sambar rice plate/i.test(meal)) add("Sambar Rice Plate");
  if (/sambar rice bowl/i.test(meal)) add("Sambar Rice Bowl");
  if (/spinach moong dal rice plate/i.test(meal)) add("Spinach Moong Dal Rice Plate");
  if (/spinach moong dal rice bowl/i.test(meal)) add("Spinach Moong Dal Rice Bowl");
  if (/thai peanut tofu rice bowl/i.test(meal)) add("Thai Peanut Tofu Rice Bowl");

  return matches;
}

export function MealPrepPlan() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const recipes = useMemo(() => [...data.recipes].sort((a, b) => a.name.localeCompare(b.name)), []);

  const groceryGroups = useMemo(() => {
    return Object.entries(data.grocery_list)
      .map(([group, items]) => [
        group,
        (items as GroceryItem[]).filter((item) =>
          !normalizedQuery || `${item.item} ${item.quantity} ${item.use} ${group}`.toLowerCase().includes(normalizedQuery),
        ),
      ] as const)
      .filter(([, items]) => items.length > 0);
  }, [normalizedQuery]);

  const filteredRecipes = useMemo(() => recipes.filter((recipe) =>
    !normalizedQuery || `${recipe.name} ${recipe.best_for} ${Object.keys(recipe.ingredients).join(" ")}`.toLowerCase().includes(normalizedQuery),
  ), [normalizedQuery, recipes]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Indian vegetarian · mostly dairy-free</p>
            <h1>Minsi&apos;s weekly meal prep plan</h1>
            <p className={styles.summary}>
              A practical Saturday-to-Saturday plan built around quick workday breakfasts,
              balanced bowls, and two manageable prep sessions.
            </p>
            <div className={styles.profileChips}>
              <span>No maida</span><span>Low added sugar</span><span>Fiber-forward</span><span>Iron-conscious</span>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div><strong>2</strong><span>prep days</span></div>
            <div><strong>14</strong><span>recipes</span></div>
            <div><strong>8</strong><span>menu days</span></div>
          </div>
        </section>

        <nav className={styles.sectionNav} aria-label="Meal plan sections">
          <div className={styles.navLinks}>
            {sectionLinks.map(([href, label]) => <a href={`#${href}`} key={href}>{label}</a>)}
          </div>
          <label className={styles.search}>
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search food or recipe" />
          </label>
        </nav>

        <section id="groceries" className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Shop on Saturday</p><h2>Grocery list</h2></div>
            <p>{normalizedQuery ? `${groceryGroups.reduce((sum, [, items]) => sum + items.length, 0)} matching items` : "Grouped to make one weekly grocery run quick and calm."}</p>
          </div>
          <div className={styles.groceryGrid}>
            {groceryGroups.map(([group, items]) => (
              <article className={`${styles.groceryCard} ${group === "Avoid Buying" ? styles.avoidCard : ""}`} key={group}>
                <header><span>{groceryIcons[group] ?? "•"}</span><div><h3>{group}</h3><p>{items.length} items</p></div></header>
                <ul>
                  {items.map((item) => (
                    <li key={item.item}>
                      <label><input type="checkbox" /><span><strong>{item.item}</strong><small>{item.quantity}</small><em>{item.use}</em></span></label>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          {groceryGroups.length === 0 && <p className={styles.empty}>No grocery items match “{query}”.</p>}
        </section>

        <section id="meal-prep" className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Two lighter sessions</p><h2>Meal prep plan</h2></div>
            <p>Store grains, proteins, vegetables, greens, and sauces separately for better texture.</p>
          </div>
          <div className={styles.prepGrid}>
            {Object.entries(data.meal_prep).map(([day, prep]) => {
              const typedPrep = prep as PrepDay;
              return (
                <article className={styles.prepCard} key={day}>
                  <header><div><p>{typedPrep.theme}</p><h3>{day} prep</h3></div><span>{typedPrep.covers}</span></header>
                  <div className={styles.batchOverview}>
                    {typedPrep.overview.map((item) => <div key={item.item}><strong>{item.item}</strong><span>{item.quantity}</span><small>{item.used_for}</small></div>)}
                  </div>
                  <h4>Prep steps</h4>
                  <ol className={styles.prepSteps}>
                    {typedPrep.steps.map((step, index) => <li key={step}><label><input type="checkbox" /><span><b>{String(index + 1).padStart(2, "0")}</b>{step}</span></label></li>)}
                  </ol>
                </article>
              );
            })}
          </div>
        </section>

        <section id="weekly-menu" className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Saturday to Saturday</p><h2>Weekly menu</h2></div>
            <p>Tuesday is the flexible work-from-home breakfast; other mornings stay fast.</p>
          </div>
          <div className={styles.menuTableWrap}>
            <table className={styles.menuTable}>
              <thead><tr><th>Day</th><th>Breakfast</th><th>Lunch</th><th>Snacks</th><th>Dinner</th></tr></thead>
              <tbody>
                {data.weekly_menu.map((day, index) => (
                  <tr key={`${day.day}-${index}`}>
                    <th><span>{String(index + 1).padStart(2, "0")}</span>{day.day}</th>
                    {(["breakfast", "lunch", "snacks", "dinner"] as const).map((mealType) => {
                      const linkedRecipes = recipesForMeal(day[mealType], recipes);
                      return <td key={mealType}><p>{day[mealType]}</p>{linkedRecipes.length > 0 && <div className={styles.recipeLinks}>{linkedRecipes.map((recipe) => <a key={recipe.name} href={`#recipe-${slugify(recipe.name)}`}>View recipe ↘</a>)}</div>}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="recipes" className={styles.section}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>A–Z collection</p><h2>Recipes</h2></div>
            <p>{filteredRecipes.length} of {recipes.length} recipes</p>
          </div>
          <div className={styles.recipeIndex}>
            {filteredRecipes.map((recipe) => <a href={`#recipe-${slugify(recipe.name)}`} key={recipe.name}>{recipe.name}<span>↘</span></a>)}
          </div>
          <div className={styles.recipeList}>
            {filteredRecipes.map((recipe, index) => (
              <details className={styles.recipeCard} id={`recipe-${slugify(recipe.name)}`} key={recipe.name} open={index === 0 && !normalizedQuery}>
                <summary><span>{recipe.name.charAt(0)}</span><div><h3>{recipe.name}</h3><p>{recipe.best_for}</p></div><b>+</b></summary>
                <div className={styles.recipeBody}>
                  <div className={styles.recipeMeta}><span>Servings</span><strong>{recipe.servings}</strong></div>
                  <div className={styles.ingredientColumns}>
                    {Object.entries(recipe.ingredients).map(([group, ingredients]) => (
                      <div key={group}><h4>{group}</h4><dl>{ingredientPairs(ingredients).map(([ingredient, quantity]) => <Fragment key={ingredient}><dt>{ingredient}</dt><dd>{quantity}</dd></Fragment>)}</dl></div>
                    ))}
                  </div>
                  <div className={styles.recipeDetails}>
                    <div><h4>Method</h4><ol>{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol></div>
                    <aside><h4>Meal prep notes</h4><ul>{recipe.meal_prep_notes.map((note) => <li key={note}>{note}</li>)}</ul><h4>Health notes</h4><ul>{recipe.health_notes.map((note) => <li key={note}>{note}</li>)}</ul></aside>
                  </div>
                </div>
              </details>
            ))}
          </div>
          {filteredRecipes.length === 0 && <p className={styles.empty}>No recipes match “{query}”.</p>}
        </section>
      </main>
    </div>
  );
}
