"use client";

import Link from "next/link";
import { useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toPascalCase } from "@/lib/format";
import { getPrimaryMood, getPrimaryNutritionFocus } from "@/lib/recipe-classification";
import { filterRecipes } from "@/lib/recipe-filters";
import type { Recipe } from "@/lib/recipes";
import styles from "@/app/recipes/page.module.css";

type RecipeLibraryClientProps = {
  recipes: Recipe[];
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

type SwipeState = {
  recipeId: string;
  pointerId: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
};

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
  initialFilters,
}: RecipeLibraryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLElement | null>(null);
  const landingCardRef = useRef<HTMLElement | null>(null);
  const firstRecipeCardRef = useRef<HTMLElement | null>(null);
  const swipeStateRef = useRef<SwipeState | null>(null);
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

  useEffect(() => {
    function scrollToRequestedSlide() {
      if (window.location.hash !== "#first-recipe") {
        return;
      }

      if (!window.matchMedia("(max-width: 720px)").matches) {
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
        window.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      window.requestAnimationFrame(() => {
        const list = listRef.current;
        const target = filteredRecipes.length > 0
          ? firstRecipeCardRef.current
          : landingCardRef.current;

        if (list && target) {
          list.scrollTo({
            top: target.offsetTop - list.offsetTop,
            behavior: "auto",
          });
        }

        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      });
    }

    scrollToRequestedSlide();
    window.addEventListener("hashchange", scrollToRequestedSlide);

    return () => {
      window.removeEventListener("hashchange", scrollToRequestedSlide);
    };
  }, [filteredRecipes.length, searchParams]);

  function handleRecipePointerDown(
    event: React.PointerEvent<HTMLElement>,
    recipeId: string,
  ) {
    if (!event.isPrimary || event.pointerType === "mouse") {
      swipeStateRef.current = null;
      return;
    }

    swipeStateRef.current = {
      recipeId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      deltaX: 0,
      deltaY: 0,
    };
  }

  function handleRecipePointerMove(event: React.PointerEvent<HTMLElement>) {
    const swipeState = swipeStateRef.current;

    if (!swipeState || swipeState.pointerId !== event.pointerId) {
      return;
    }

    swipeStateRef.current = {
      ...swipeState,
      deltaX: event.clientX - swipeState.startX,
      deltaY: event.clientY - swipeState.startY,
    };
  }

  function clearSwipeState(pointerId: number) {
    if (swipeStateRef.current?.pointerId === pointerId) {
      swipeStateRef.current = null;
    }
  }

  function handleRecipePointerUp(event: React.PointerEvent<HTMLElement>) {
    const swipeState = swipeStateRef.current;

    if (!swipeState || swipeState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - swipeState.startX;
    const deltaY = event.clientY - swipeState.startY;
    const isLeftSwipe = deltaX <= -72;
    const isHorizontalIntent = Math.abs(deltaX) > Math.abs(deltaY) * 1.35;

    swipeStateRef.current = null;

    if (isLeftSwipe && isHorizontalIntent) {
      router.push(`/recipes/${swipeState.recipeId}`);
    }
  }

  return (
    <>
      <section ref={listRef} className={styles.list}>
        <article
          ref={landingCardRef}
          className={`${styles.card} ${styles.landingCard}`}
        >
          <div className={`${styles.cardInner} ${styles.landingCardInner}`}>
            <div>
              <p className={styles.eyebrow}>Fibre Fueled Foods</p>
              <h1>Recipe Library</h1>
              <p className={styles.subheading}>
                Find perfect recipe for you among {recipes.length} recipes
              </p>
            </div>

            <div className={styles.reelHints} aria-hidden="true">
              <span>Swipe up to start</span>
            </div>
          </div>
        </article>

        {filteredRecipes.length === 0 ? (
          <article className={styles.emptyState}>
            <h2>No Matching Recipes</h2>
            <p>Try a broader search term or adjust one of the filters.</p>
          </article>
        ) : null}

        {filteredRecipes.map((recipe, index) => (
          <article
            key={recipe.id}
            id={index === 0 ? "first-recipe-card" : undefined}
            ref={index === 0 ? firstRecipeCardRef : undefined}
            className={styles.card}
            onPointerDown={(event) => handleRecipePointerDown(event, recipe.id)}
            onPointerMove={handleRecipePointerMove}
            onPointerUp={handleRecipePointerUp}
            onPointerCancel={(event) => clearSwipeState(event.pointerId)}
          >
            <div className={styles.cardInner}>
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

              <div className={styles.reelHints} aria-hidden="true">
                <span>Swipe up for next</span>
                <span>Swipe left to open</span>
              </div>

              <Link href={`/recipes/${recipe.id}`} className={styles.link}>
                View Recipe
              </Link>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
