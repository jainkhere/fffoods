"use client";

import { Fragment, useMemo, useState } from "react";
import data from "../../../data/weekly_meal_prep_seed_data.json";
import styles from "./page.module.css";

type GroceryItem = { item: string; quantity: string; covers: string };
type GroceryCategory = { category: string; items: GroceryItem[] };
type GroceryTrip = { purpose: string; categories: GroceryCategory[] };
type PrepOption = { name: string; choose_when: string; prep: string[] };
type PrepDay = {
  covers: string;
  theme: string;
  rule: string;
  formula: string[];
  options: PrepOption[];
  recommended_default: string;
};
type Recipe = (typeof data.recipes)[number];
type MealType = "breakfast" | "lunch" | "snacks" | "dinner";
type FlexibleMenuDay = {
  day: string;
  breakfast?: string;
  breakfast_options?: string[];
  lunch?: string;
  lunch_options?: string[];
  snacks?: string;
  snacks_options?: string[];
  dinner?: string;
  dinner_options?: string[];
};

const sectionLinks = [
  ["groceries", "Grocery list"],
  ["meal-prep", "Meal prep"],
  ["weekly-menu", "Weekly menu"],
  ["veggie-prep", "Veg prep"],
  ["recipes", "Recipes"],
] as const;

const groceryIcons: Record<string, string> = {
  "Base Grains and Breakfast": "🌾",
  "Dals, Beans, and Protein": "🫘",
  "Shared Vegetables": "🥕",
  Fruits: "🥝",
  "Seeds, Sauces, Pantry": "🫙",
  "South Indian Refresh": "🥥",
  "Sambar and Side Vegetables": "🎃",
  "Fresh Bowl Refresh": "🥬",
  "Thai / Tofu Refresh": "🥜",
  "Fruit Refresh": "🍐",
};

function ingredientPairs(value: unknown): [string, string][] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): [string, string][] => {
    if (Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string") return [[entry[0], entry[1]]];
    if (entry && typeof entry === "object" && "item" in entry && "quantity" in entry) {
      const { item, quantity } = entry as { item: unknown; quantity: unknown };
      return typeof item === "string" && typeof quantity === "string" ? [[item, quantity]] : [];
    }
    return [];
  });
}

function optionsForMeal(day: FlexibleMenuDay, mealType: MealType) {
  const single = day[mealType];
  const options = day[`${mealType}_options` as keyof FlexibleMenuDay];
  if (Array.isArray(options)) return options;
  return typeof single === "string" ? [single] : [];
}

function recipesForMeal(meal: string, recipes: Recipe[]) {
  const normalized = meal.toLowerCase();
  const matches = recipes.filter((recipe) => normalized.includes(recipe.name.toLowerCase()));
  const add = (name: string) => {
    const recipe = recipes.find((candidate) => candidate.name === name);
    if (recipe && !matches.includes(recipe)) matches.push(recipe);
  };

  if (/pav bhaji/i.test(meal)) add("High-Veg Pav Bhaji with Whole Grain Toast/Roti");
  if (/idli.*sambar/i.test(meal)) add("Idli with Sambar and Coconut Chutney");
  if (/overnight oats/i.test(meal)) {
    add(/kiwi/i.test(meal) ? "Overnight Oats with Kiwi, Chia & Flaxseed" : "Overnight Oats with Berries, Chia & Flaxseed");
  }
  if (/tofu curry/i.test(meal)) add("Tofu Curry Rice Bowl using Pyaaz-Tamatar-Garlic Gravy");
  if (/gravy-based tofu|chana bowl/i.test(meal)) add("Gravy-Based Tofu/Chana Bowl");
  return matches;
}

export function MealPrepPlan() {
  const [query, setQuery] = useState("");
  const [checkedGroceries, setCheckedGroceries] = useState<Set<string>>(() => new Set());
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [prepModes, setPrepModes] = useState<Record<string, string>>({ Saturday: "Balanced Week", Tuesday: "Balanced Week" });
  const normalizedQuery = query.trim().toLowerCase();
  const recipes = useMemo(() => [...data.recipes].sort((a, b) => a.name.localeCompare(b.name)), []);

  const groceryTrips = useMemo(() => {
    return Object.entries(data.grocery_trips).map(([tripName, trip]) => {
      const typedTrip = trip as GroceryTrip;
      return {
        tripName,
        purpose: typedTrip.purpose,
        categories: typedTrip.categories
          .map((category) => ({
            ...category,
            items: category.items.filter((item) =>
              !normalizedQuery || `${item.item} ${item.quantity} ${item.covers} ${category.category} ${tripName}`.toLowerCase().includes(normalizedQuery),
            ),
          }))
          .filter((category) => category.items.length > 0),
      };
    }).filter((trip) => trip.categories.length > 0);
  }, [normalizedQuery]);

  const allUncheckedTrips = useMemo(() => Object.entries(data.grocery_trips).map(([tripName, trip]) => ({
    tripName,
    categories: (trip as GroceryTrip).categories.map((category) => ({
      category: category.category,
      items: category.items.filter((item) => !checkedGroceries.has(`${tripName}::${category.category}::${item.item}`)),
    })).filter((category) => category.items.length > 0),
  })).filter((trip) => trip.categories.length > 0), [checkedGroceries]);

  const uncheckedGroceryCount = allUncheckedTrips.reduce((total, trip) => total + trip.categories.reduce((sum, category) => sum + category.items.length, 0), 0);
  const whatsAppDigits = whatsAppNumber.replace(/\D/g, "");
  const whatsAppMessage = [
    "Minsi's flexible weekly grocery list", "",
    ...allUncheckedTrips.flatMap((trip) => [
      `*${trip.tripName}*`,
      ...trip.categories.flatMap((category) => [
        `_${category.category}_`,
        ...category.items.map((item) => `• ${item.item} — ${item.quantity}`),
      ]),
      "",
    ]),
  ].join("\n").trim();
  const whatsAppHref = whatsAppDigits && uncheckedGroceryCount > 0
    ? `https://wa.me/${whatsAppDigits}?text=${encodeURIComponent(whatsAppMessage)}`
    : null;

  const weeklyMenu = useMemo(() => {
    const combined: Array<{ day: string; meals: Record<MealType, string[]> }> = [];
    (data.flexible_weekly_template as FlexibleMenuDay[]).forEach((entry) => {
      let target = combined.find((day) => day.day === entry.day);
      if (!target) {
        target = { day: entry.day, meals: { breakfast: [], lunch: [], snacks: [], dinner: [] } };
        combined.push(target);
      }
      (["breakfast", "lunch", "snacks", "dinner"] as MealType[]).forEach((mealType) => {
        optionsForMeal(entry, mealType).forEach((meal) => {
          if (!target?.meals[mealType].includes(meal)) target?.meals[mealType].push(meal);
        });
      });
    });
    return combined;
  }, []);

  const filteredRecipes = useMemo(() => recipes.filter((recipe) =>
    !normalizedQuery || `${recipe.name} ${recipe.best_for} ${recipe.categories.join(" ")} ${Object.keys(recipe.ingredients).join(" ")}`.toLowerCase().includes(normalizedQuery),
  ), [normalizedQuery, recipes]);

  function toggleGroceryItem(key: string) {
    setCheckedGroceries((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function openRecipe(recipe: Recipe) {
    const recipeId = `recipe-${recipe.slug}`;
    setQuery("");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.getElementById(recipeId);
      if (!(target instanceof HTMLDetailsElement)) return;
      target.open = true;
      window.history.replaceState(null, "", `#${recipeId}`);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Flexible · Indian vegetarian · mostly dairy-free</p>
            <h1>Minsi&apos;s weekly meal prep plan</h1>
            <p className={styles.summary}>Choose a prep mode based on your mood, then mix building blocks into meals throughout the week—less rigidity, less waste.</p>
            <div className={styles.profileChips}><span>No maida default</span><span>Low added sugar</span><span>Cooked-veg forward</span><span>Iron-conscious</span></div>
          </div>
          <div className={styles.heroStats}><div><strong>2</strong><span>grocery trips</span></div><div><strong>20</strong><span>recipes</span></div><div><strong>4</strong><span>prep modes</span></div></div>
        </section>

        <nav className={styles.sectionNav} aria-label="Meal plan sections">
          <div className={styles.navLinks}>{sectionLinks.map(([href, label]) => <a href={`#${href}`} key={href}>{label}</a>)}</div>
          <label className={styles.search}><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search food or recipe" /></label>
        </nav>

        <section id="groceries" className={styles.section}>
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>Two smaller trips</p><h2>Grocery list</h2></div><p>Saturday is the main shop; Tuesday refreshes delicate produce and South Indian ingredients.</p></div>
          <div className={styles.prepGroceryLists}>
            {groceryTrips.map((trip, tripIndex) => (
              <section className={styles.prepGrocerySection} key={trip.tripName}>
                <header className={styles.prepGroceryHeader}><span>{tripIndex === 0 ? "SAT" : "TUE"}</span><div><h3>{trip.tripName}</h3><p>{trip.purpose}</p></div></header>
                <div className={styles.groceryGrid}>
                  {trip.categories.map((category) => (
                    <article className={styles.groceryCard} key={`${trip.tripName}-${category.category}`}>
                      <header><span>{groceryIcons[category.category] ?? "•"}</span><div><h3>{category.category}</h3><p>{category.items.length} items</p></div></header>
                      <ul>{category.items.map((item) => {
                        const key = `${trip.tripName}::${category.category}::${item.item}`;
                        return <li key={item.item}><label><input type="checkbox" checked={checkedGroceries.has(key)} onChange={() => toggleGroceryItem(key)} /><span><strong>{item.item}</strong><small>{item.quantity}</small><em>{item.covers}</em></span></label></li>;
                      })}</ul>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
          {groceryTrips.length === 0 && <p className={styles.empty}>No grocery items match “{query}”.</p>}
          <aside className={styles.whatsAppPanel}>
            <div className={styles.whatsAppCopy}><span aria-hidden="true">✓</span><div><p className={styles.kicker}>Shop what&apos;s missing</p><h3>Send unchecked items to WhatsApp</h3><p>{uncheckedGroceryCount} item{uncheckedGroceryCount === 1 ? "" : "s"} still on your two-trip list.</p></div></div>
            <div className={styles.whatsAppControls}><label><span>WhatsApp number</span><input type="tel" inputMode="tel" value={whatsAppNumber} onChange={(event) => setWhatsAppNumber(event.target.value)} placeholder="Country code + number" aria-describedby="whatsapp-number-help" /><small id="whatsapp-number-help">Include country code, without spaces or symbols.</small></label>{whatsAppHref ? <a href={whatsAppHref} target="_blank" rel="noreferrer">Send on WhatsApp ↗</a> : <button type="button" disabled>{uncheckedGroceryCount === 0 ? "All items checked" : "Enter number to send"}</button>}</div>
          </aside>
        </section>

        <section id="meal-prep" className={styles.section}>
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>Choose, don&apos;t overcook</p><h2>Flexible meal prep</h2></div><p>Pick one mode for each prep day. Each mode makes 1–2 mains plus reusable building blocks.</p></div>
          <div className={styles.prepGrid}>
            {Object.entries(data.prep_framework).map(([day, prep]) => {
              const typedPrep = prep as PrepDay;
              const selected = typedPrep.options.find((option) => option.name === prepModes[day]) ?? typedPrep.options[0];
              return <article className={styles.prepCard} key={day}>
                <header><div><p>{typedPrep.theme}</p><h3>{day} prep</h3></div><span>{typedPrep.covers}</span></header>
                <p className={styles.prepRule}>{typedPrep.rule}</p>
                <div className={styles.optionChooser} aria-label={`${day} prep mode`}>
                  {typedPrep.options.map((option) => <button type="button" aria-pressed={selected.name === option.name} key={option.name} onClick={() => setPrepModes((current) => ({ ...current, [day]: option.name }))}>{option.name}</button>)}
                </div>
                <div className={styles.selectedPrep}><p>{selected.choose_when}</p><h4>{selected.name} checklist</h4><ul>{selected.prep.map((item) => <li key={item}><label><input type="checkbox" /><span>{item}</span></label></li>)}</ul></div>
                <details className={styles.formula}><summary>See the flexible formula</summary><ul>{typedPrep.formula.map((item) => <li key={item}>{item}</li>)}</ul></details>
              </article>;
            })}
          </div>
          <div className={styles.mealPools}>
            {Object.entries(data.meal_pools).map(([poolName, meals]) => <article className={styles.poolCard} key={poolName}><p className={styles.kicker}>Mix-and-match meals</p><h3>{poolName}</h3><div>{meals.map((meal) => {
              const recipe = recipes.find((candidate) => candidate.name === meal.meal_name);
              return <section key={meal.meal_name}><h4>{meal.meal_name}</h4><p>{meal.uses.join(" · ")}</p>{recipe && <button type="button" onClick={() => openRecipe(recipe)}>View recipe ↘</button>}</section>;
            })}</div></article>)}
          </div>
        </section>

        <section id="weekly-menu" className={styles.section}>
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>Options, not obligations</p><h2>Flexible weekly menu</h2></div><p>Choose one option in each meal slot based on what you prepped and what sounds good.</p></div>
          <div className={styles.menuTableWrap}><table className={styles.menuTable}><thead><tr><th>Day</th><th>Breakfast</th><th>Lunch options</th><th>Snacks</th><th>Dinner options</th></tr></thead><tbody>
            {weeklyMenu.map((day, index) => <tr key={day.day}><th><span>{String(index + 1).padStart(2, "0")}</span>{day.day}</th>{(["breakfast", "lunch", "snacks", "dinner"] as MealType[]).map((mealType) => <td key={mealType} data-label={mealType.charAt(0).toUpperCase() + mealType.slice(1)}><div className={styles.menuEntries}>{day.meals[mealType].map((meal) => {
              const linkedRecipes = recipesForMeal(meal, recipes);
              return <div className={styles.menuEntry} key={meal}><p>{meal}</p>{linkedRecipes.length > 0 && <div className={styles.recipeLinks}>{linkedRecipes.map((recipe) => <button type="button" key={recipe.name} onClick={() => openRecipe(recipe)}>View recipe ↘</button>)}</div>}</div>;
            })}</div></td>)}</tr>)}
          </tbody></table></div>
        </section>

        <section id="veggie-prep" className={styles.section}>
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>Gut-friendly vegetable guide</p><h2>Cook the base, top with crunch</h2></div><p>{data.vegetable_prep_guide.recommendation}</p></div>
          <div className={styles.ratioGrid}>{Object.entries(data.vegetable_prep_guide.gut_friendly_bowl_ratio).map(([label, amount]) => <article key={label}><strong>{amount}</strong><span>{label.replaceAll("_", " ")}</span></article>)}</div>
          <div className={styles.methodTable}><table><thead><tr><th>Method</th><th>Best for</th><th>Fridge</th><th>Gut fit</th></tr></thead><tbody>{data.vegetable_prep_guide.method_comparison.map((method) => <tr key={method.method}><th>{method.method}</th><td>{method.best_for}</td><td>{method.fridge_stability}</td><td>{method.gut_friendliness}</td></tr>)}</tbody></table></div>
          <div className={styles.vegMethodGrid}>
            <article><h3>Roasting</h3><p>{data.vegetable_prep_guide.roasting.add_later}</p><ol>{data.vegetable_prep_guide.roasting.steps.map((step) => <li key={step}>{step}</li>)}</ol></article>
            <article><h3>Steaming</h3><div className={styles.steamTimes}>{data.vegetable_prep_guide.steaming.times.map((item) => <span key={item.vegetable}><b>{item.vegetable}</b>{item.time}</span>)}</div><ol>{data.vegetable_prep_guide.steaming.steps.map((step) => <li key={step}>{step}</li>)}</ol></article>
            <article><h3>Sautéing</h3><p>Best for {data.vegetable_prep_guide.sauteing.best_vegetables.join(", ")}.</p><h4>Cabbage poriyal</h4><ol>{data.vegetable_prep_guide.sauteing.cabbage_poriyal_steps.map((step) => <li key={step}>{step}</li>)}</ol><h4>Bhindi sabzi</h4><ol>{data.vegetable_prep_guide.sauteing.bhindi_sabzi_steps.map((step) => <li key={step}>{step}</li>)}</ol></article>
          </div>
          <aside className={styles.storageRules}><h3>Storage rules</h3><ul>{data.vegetable_prep_guide.storage_rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></aside>
        </section>

        <section id="recipes" className={styles.section}>
          <div className={styles.sectionHeading}><div><p className={styles.kicker}>A–Z collection</p><h2>Recipes</h2></div><p>{filteredRecipes.length} of {recipes.length} recipes</p></div>
          <div className={styles.recipeIndex}>{filteredRecipes.map((recipe) => <a href={`#recipe-${recipe.slug}`} key={recipe.name}>{recipe.name}<span>↘</span></a>)}</div>
          <div className={styles.recipeList}>{filteredRecipes.map((recipe, index) => <details className={styles.recipeCard} id={`recipe-${recipe.slug}`} key={recipe.name} open={index === 0 && !normalizedQuery}><summary><span>{recipe.name.charAt(0)}</span><div><h3>{recipe.name}</h3><p>{recipe.best_for}</p></div><b>+</b></summary><div className={styles.recipeBody}>
            <div className={styles.recipeTags}>{recipe.categories.map((category) => <span key={category}>{category}</span>)}</div>
            <div className={styles.recipeMeta}><span>Servings</span><strong>{recipe.servings}</strong></div>
            <div className={styles.ingredientColumns}>{Object.entries(recipe.ingredients).map(([group, ingredients]) => <div key={group}><h4>{group}</h4><dl>{ingredientPairs(ingredients).map(([ingredient, quantity]) => <Fragment key={ingredient}><dt>{ingredient}</dt><dd>{quantity}</dd></Fragment>)}</dl></div>)}</div>
            <div className={styles.recipeDetails}><div><h4>Method</h4><ol>{recipe.steps.map((step) => <li key={step}>{step}</li>)}</ol></div><aside><h4>Meal prep notes</h4><ul>{recipe.meal_prep_notes.map((note) => <li key={note}>{note}</li>)}</ul><h4>Health notes</h4><ul>{recipe.health_notes.map((note) => <li key={note}>{note}</li>)}</ul></aside></div>
          </div></details>)}</div>
          {filteredRecipes.length === 0 && <p className={styles.empty}>No recipes match “{query}”.</p>}
        </section>
      </main>
    </div>
  );
}
