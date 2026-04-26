import Link from "next/link";
import { toPascalCase } from "@/lib/format";
import type { Recipe } from "@/lib/recipes";
import styles from "./recipe-detail.module.css";

type RecipeDetailProps = {
  recipe: Recipe;
  recipes: Recipe[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function linkRecipeMentions(text: string, currentRecipeId: string, recipes: Recipe[]) {
  const linkableRecipes = recipes
    .filter((candidate) => candidate.id !== currentRecipeId)
    .sort((left, right) => right.title.length - left.title.length);

  if (linkableRecipes.length === 0) {
    return text;
  }

  const pattern = new RegExp(
    `(${linkableRecipes.map((candidate) => escapeRegExp(candidate.title)).join("|")})`,
    "gi",
  );

  const matches = [...text.matchAll(pattern)];

  if (matches.length === 0) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const matchedText = match[0];
    const startIndex = match.index ?? 0;

    if (startIndex > lastIndex) {
      parts.push(text.slice(lastIndex, startIndex));
    }

    const matchedRecipe = linkableRecipes.find(
      (candidate) => candidate.title.toLowerCase() === matchedText.toLowerCase(),
    );

    if (matchedRecipe) {
      parts.push(
        <Link
          key={`${matchedRecipe.id}-${startIndex}-${index}`}
          href={`/recipes/${matchedRecipe.id}`}
          className={styles.inlineRecipeLink}
        >
          {matchedText}
        </Link>,
      );
    } else {
      parts.push(matchedText);
    }

    lastIndex = startIndex + matchedText.length;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function RecipeDetail({ recipe, recipes }: RecipeDetailProps) {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Fibre Fueled Foods</p>
          <h1>{recipe.title}</h1>
          <p className={styles.summary}>
            {typeof recipe.week === "number" ? `Week ${recipe.week}` : "Recipe"} 
            {typeof recipe.day === "number" ? `, day ${recipe.day}` : ""}, details
            from the local dataset.
          </p>

          <div className={styles.stats}>
            <div>
              <span>Meal</span>
              <strong>{recipe.mealType}</strong>
            </div>
            <div>
              <span>Plant points</span>
              <strong>{recipe.plantPoints}</strong>
            </div>
            <div>
              <span>Low FODMAP</span>
              <strong>{recipe.lowFodmap ? "Yes" : "No"}</strong>
            </div>
          </div>
        </section>

        <section className={styles.grid}>
          <article className={styles.card}>
            <h2>Ingredients</h2>
            <ul>
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient}>
                  {linkRecipeMentions(ingredient, recipe.id, recipes)}
                </li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Instructions</h2>
            <ol>
              {recipe.instructions.map((step) => (
                <li key={step}>{linkRecipeMentions(step, recipe.id, recipes)}</li>
              ))}
            </ol>
          </article>

          <article className={styles.card}>
            <h2>Notes</h2>
            <ul>
              {recipe.notes.map((note) => (
                <li key={note}>{linkRecipeMentions(note, recipe.id, recipes)}</li>
              ))}
            </ul>
          </article>

          <article className={styles.card}>
            <h2>Tags</h2>
            <div className={styles.tags}>
              {recipe.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {toPascalCase(tag)}
                </span>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
