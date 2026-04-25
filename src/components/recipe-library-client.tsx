"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
  useTransition,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toPascalCase } from "@/lib/format";
import { getPrimaryMood, getPrimaryNutritionFocus } from "@/lib/recipe-classification";
import { filterRecipes } from "@/lib/recipe-filters";
import type { Recipe } from "@/lib/recipes";
import styles from "@/app/recipes/page.module.css";

type RecipeLibraryClientProps = {
  recipes: Recipe[];
  availableWeeks: number[];
  availableMealTypes: string[];
  availableIngredientThemes: string[];
  nutritionFocusOptions: readonly string[];
  moodOptions: readonly string[];
  initialFilters: {
    query: string;
    week?: number;
    mealType?: string;
    lowFodmap?: boolean;
    makeAhead?: boolean;
    ingredientTheme?: string;
    nutritionFocus?: string;
    mood?: string;
  };
};

type FilterState = RecipeLibraryClientProps["initialFilters"];

function getRecipeCardSummary(notes: string[], day: number | undefined, lowFodmap: boolean) {
  const descriptiveNote = notes.find((note) => {
    const normalized = note.trim().toLowerCase();

    return !(
      normalized.startsWith("serves ") ||
      normalized.startsWith("makes ") ||
      normalized.startsWith("keep ") ||
      normalized.startsWith("make-ahead ") ||
      normalized.startsWith("fodmap ") ||
      normalized.startsWith("low fodmap ")
    );
  });

  if (descriptiveNote) {
    return descriptiveNote;
  }

  return `${typeof day === "number" ? `Day ${day}. ` : ""}${
    lowFodmap ? "Low FODMAP." : "Not marked low FODMAP."
  }`;
}

function buildSearch(filters: FilterState) {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (typeof filters.week === "number") {
    params.set("week", String(filters.week));
  }

  if (filters.mealType) {
    params.set("mealType", filters.mealType);
  }

  if (filters.lowFodmap) {
    params.set("lowFodmap", "true");
  }

  if (filters.makeAhead) {
    params.set("makeAhead", "true");
  }

  if (filters.ingredientTheme) {
    params.set("ingredientTheme", filters.ingredientTheme);
  }

  if (filters.nutritionFocus) {
    params.set("nutritionFocus", filters.nutritionFocus);
  }

  if (filters.mood) {
    params.set("mood", filters.mood);
  }

  const search = params.toString();
  return search ? `?${search}` : "";
}

function parseFilters(searchParams: URLSearchParams): FilterState {
  const week = searchParams.get("week");
  const mealType = searchParams.get("mealType");
  const ingredientTheme = searchParams.get("ingredientTheme");
  const nutritionFocus = searchParams.get("nutritionFocus");
  const mood = searchParams.get("mood");

  return {
    query: searchParams.get("q")?.trim() ?? "",
    week: week && /^\d+$/.test(week) ? Number(week) : undefined,
    mealType: mealType?.trim() || undefined,
    lowFodmap: searchParams.get("lowFodmap") === "true" ? true : undefined,
    makeAhead: searchParams.get("makeAhead") === "true" ? true : undefined,
    ingredientTheme: ingredientTheme?.trim() || undefined,
    nutritionFocus: nutritionFocus?.trim() || undefined,
    mood: mood?.trim() || undefined,
  };
}

export function RecipeLibraryClient({
  recipes,
  availableWeeks,
  availableMealTypes,
  availableIngredientThemes,
  nutritionFocusOptions,
  moodOptions,
  initialFilters,
}: RecipeLibraryClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const urlFilters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const filters = urlFilters.query ||
    urlFilters.week ||
    urlFilters.mealType ||
    urlFilters.lowFodmap ||
    urlFilters.makeAhead ||
    urlFilters.ingredientTheme ||
    urlFilters.nutritionFocus ||
    urlFilters.mood
    ? urlFilters
    : initialFilters;
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(
    Boolean(
      urlFilters.week ||
        urlFilters.lowFodmap ||
        urlFilters.makeAhead ||
        urlFilters.ingredientTheme ||
        initialFilters.week ||
        initialFilters.lowFodmap ||
        initialFilters.makeAhead ||
        initialFilters.ingredientTheme,
    ),
  );

  const filteredRecipes = useMemo(
    () =>
      filterRecipes(recipes, {
        query: filters.query,
        week: filters.week,
        mealType: filters.mealType,
        lowFodmap: filters.lowFodmap,
        makeAhead: filters.makeAhead,
        ingredientTheme: filters.ingredientTheme,
        nutritionFocus: filters.nutritionFocus,
        mood: filters.mood,
      }),
    [filters, recipes],
  );

  function syncUrl(nextFilters: FilterState) {
    const search = buildSearch(nextFilters);

    startTransition(() => {
      router.replace(`${pathname}${search}`, { scroll: false });
    });
  }

  function updateFilters(overrides: Partial<FilterState>) {
    const nextFilters = { ...filters, ...overrides };
    syncUrl(nextFilters);
  }

  function toggleSingleValue<Key extends keyof FilterState>(
    key: Key,
    value: NonNullable<FilterState[Key]>,
  ) {
    updateFilters({
      [key]: filters[key] === value ? undefined : value,
    } as Partial<FilterState>);
  }

  function clearFilters() {
    const resetFilters: FilterState = { query: "" };
    syncUrl(resetFilters);
  }

  const hasActiveFilters = Boolean(
    filters.query ||
      filters.week ||
      filters.mealType ||
      filters.lowFodmap ||
      filters.makeAhead ||
      filters.ingredientTheme ||
      filters.nutritionFocus ||
      filters.mood,
  );

  return (
    <>
      <form
        className={styles.searchForm}
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          updateFilters({
            query: String(formData.get("q") ?? "").trim(),
          });
        }}
      >
        <label htmlFor="recipe-search" className={styles.searchLabel}>
          Search Recipes
        </label>
        <div className={styles.searchRow}>
          <input
            id="recipe-search"
            name="q"
            type="search"
            key={filters.query}
            defaultValue={filters.query}
            placeholder="Search title, ingredients, or tags"
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
          {hasActiveFilters ? (
            <button type="button" className={styles.clearLink} onClick={clearFilters}>
              Clear
            </button>
          ) : null}
        </div>
      </form>

      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <p className={styles.filterLabel}>Meal Type</p>
          <div className={styles.chipRow}>
            <button
              type="button"
              className={`${styles.chip} ${filters.mealType === undefined ? styles.chipActive : ""}`}
              onClick={() => updateFilters({ mealType: undefined })}
            >
              All
            </button>
            {availableMealTypes.map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${filters.mealType === value ? styles.chipActive : ""}`}
                onClick={() => toggleSingleValue("mealType", value)}
              >
                {toPascalCase(value)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <p className={styles.filterLabel}>Nutrition Focus</p>
          <div className={styles.chipRow}>
            <button
              type="button"
              className={`${styles.chip} ${filters.nutritionFocus === undefined ? styles.chipActive : ""}`}
              onClick={() => updateFilters({ nutritionFocus: undefined })}
            >
              All
            </button>
            {nutritionFocusOptions.map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${filters.nutritionFocus === value ? styles.chipActive : ""}`}
                onClick={() => toggleSingleValue("nutritionFocus", value)}
              >
                {toPascalCase(value)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <p className={styles.filterLabel}>What Are You In The Mood For?</p>
          <div className={styles.chipRow}>
            <button
              type="button"
              className={`${styles.chip} ${filters.mood === undefined ? styles.chipActive : ""}`}
              onClick={() => updateFilters({ mood: undefined })}
            >
              All
            </button>
            {moodOptions.map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.chip} ${filters.mood === value ? styles.chipActive : ""}`}
                onClick={() => toggleSingleValue("mood", value)}
              >
                {toPascalCase(value)}
              </button>
            ))}
          </div>
        </div>

        <details
          className={styles.advancedFiltering}
          open={isAdvancedOpen}
          onToggle={(event) => {
            setIsAdvancedOpen((event.currentTarget as HTMLDetailsElement).open);
          }}
        >
          <summary className={styles.advancedFilteringSummary}>Advanced Filtering</summary>
          <div className={styles.advancedFilteringPanel}>
            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>Week</p>
              <div className={styles.chipRow}>
                <button
                  type="button"
                  className={`${styles.chip} ${filters.week === undefined ? styles.chipActive : ""}`}
                  onClick={() => updateFilters({ week: undefined })}
                >
                  All
                </button>
                {availableWeeks.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.chip} ${filters.week === value ? styles.chipActive : ""}`}
                    onClick={() => toggleSingleValue("week", value)}
                  >
                    {toPascalCase(`week ${value}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>Low FODMAP</p>
              <div className={styles.chipRow}>
                <button
                  type="button"
                  className={`${styles.chip} ${filters.lowFodmap === undefined ? styles.chipActive : ""}`}
                  onClick={() => updateFilters({ lowFodmap: undefined })}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`${styles.chip} ${filters.lowFodmap ? styles.chipActive : ""}`}
                  onClick={() => toggleSingleValue("lowFodmap", true)}
                >
                  {toPascalCase("low fodmap")}
                </button>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <p className={styles.filterLabel}>Make-Ahead</p>
              <div className={styles.chipRow}>
                <button
                  type="button"
                  className={`${styles.chip} ${filters.makeAhead === undefined ? styles.chipActive : ""}`}
                  onClick={() => updateFilters({ makeAhead: undefined })}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`${styles.chip} ${filters.makeAhead ? styles.chipActive : ""}`}
                  onClick={() => toggleSingleValue("makeAhead", true)}
                >
                  {toPascalCase("make ahead")}
                </button>
              </div>
            </div>

            {availableIngredientThemes.length > 0 ? (
              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>Ingredient/Theme</p>
                <div className={styles.chipRow}>
                  <button
                    type="button"
                    className={`${styles.chip} ${filters.ingredientTheme === undefined ? styles.chipActive : ""}`}
                    onClick={() => updateFilters({ ingredientTheme: undefined })}
                  >
                    All
                  </button>
                  {availableIngredientThemes.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.chip} ${filters.ingredientTheme === value ? styles.chipActive : ""}`}
                      onClick={() => toggleSingleValue("ingredientTheme", value)}
                    >
                      {toPascalCase(value)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </details>
      </div>

      <section className={styles.list}>
        {filteredRecipes.length === 0 ? (
          <article className={styles.emptyState}>
            <h2>No Matching Recipes</h2>
            <p>Try a broader search term or adjust one of the filters.</p>
          </article>
        ) : null}

        {filteredRecipes.map((recipe) => (
          <article key={recipe.id} className={styles.card}>
            <div className={styles.meta}>
              <span className={styles.pill}>{toPascalCase(recipe.mealType)}</span>
              <span className={styles.pill}>
                {toPascalCase(getPrimaryNutritionFocus(recipe))}
              </span>
              <span className={styles.pill}>{toPascalCase(getPrimaryMood(recipe))}</span>
            </div>

            <Link href={`/recipes/${recipe.id}`} className={styles.contentLink}>
              <h2>{recipe.title}</h2>
              <p>
                {recipe.descriptiveNote ??
                  getRecipeCardSummary(recipe.notes, recipe.day, recipe.lowFodmap)}
              </p>
            </Link>

            <Link href={`/recipes/${recipe.id}`} className={styles.link}>
              View Recipe
            </Link>
          </article>
        ))}
      </section>
    </>
  );
}
