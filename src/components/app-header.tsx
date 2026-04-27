"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toPascalCase } from "@/lib/format";
import {
  moodOptions,
  nutritionFocusOptions,
} from "@/lib/recipe-classification";
import styles from "./app-header.module.css";

const mealTypeOptions = [
  "breakfast",
  "dessert",
  "dinner",
  "drinks",
  "lunch",
  "side",
  "snacks",
  "topping",
] as const;

type FilterDraft = {
  mealType?: string;
  nutritionFocus?: string;
  mood?: string;
};

type SearchParamsReader = Pick<URLSearchParams, "get">;

function getFilterDraftFromSearchParams(searchParams: SearchParamsReader): FilterDraft {
  return {
    mealType: searchParams.get("mealType")?.trim() || undefined,
    nutritionFocus: searchParams.get("nutritionFocus")?.trim() || undefined,
    mood: searchParams.get("mood")?.trim() || undefined,
  };
}

function shouldUseRecipeReelJump() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        d="M15 5 8 12l7 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        d="M4 6h16M7 12h10m-7 6h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        d="m6 6 12 12M18 6 6 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        d="M4 11.5 12 5l8 6.5V20h-5.5v-5h-5v5H4z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
      <path
        d="M18 14.5A6.5 6.5 0 0 1 9.5 6a7.5 7.5 0 1 0 8.5 8.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const segments = pathname.split("/").filter(Boolean);
  const isHomePage = pathname === "/";
  const isRecipeFlow = pathname === "/recipes" || pathname.startsWith("/recipes/");
  const showRecipeSearch = isRecipeFlow;
  const showBack = segments.length > 1;
  const recipeQuery = searchParams.get("q")?.trim() ?? "";
  const searchParamDraft = getFilterDraftFromSearchParams(searchParams);
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(searchParamDraft);

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);
  }

  function toggleFilterValue(key: keyof FilterDraft, value: string) {
    setFilterDraft((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
  }

  function applyRecipeFilters(nextDraft: FilterDraft) {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.delete("week");
    nextParams.delete("lowFodmap");
    nextParams.delete("makeAhead");
    nextParams.delete("ingredientTheme");

    if (nextDraft.mealType) {
      nextParams.set("mealType", nextDraft.mealType);
    } else {
      nextParams.delete("mealType");
    }

    if (nextDraft.nutritionFocus) {
      nextParams.set("nutritionFocus", nextDraft.nutritionFocus);
    } else {
      nextParams.delete("nutritionFocus");
    }

    if (nextDraft.mood) {
      nextParams.set("mood", nextDraft.mood);
    } else {
      nextParams.delete("mood");
    }

    const nextSearch = nextParams.toString();
    const href = `${nextSearch ? `/recipes?${nextSearch}` : "/recipes"}#first-recipe`;

    if (pathname === "/recipes") {
      router.replace(href, { scroll: false });
    } else {
      router.push(href);
    }
  }

  function handleClearFilters() {
    const resetDraft: FilterDraft = {};

    setFilterDraft(resetDraft);
    setIsFilterOpen(false);

    if (pathname === "/recipes") {
      router.replace("/recipes", { scroll: false });
      return;
    }

    router.push("/recipes");
  }

  function handleApplyFilters() {
    applyRecipeFilters(filterDraft);
    setIsFilterOpen(false);
  }

  function handleOpenFilters() {
    setFilterDraft(searchParamDraft);
    setIsFilterOpen(true);
  }

  function handleCloseFilters() {
    setIsFilterOpen(false);
  }

  const hasActiveRecipeFilters = Boolean(
    searchParams.get("mealType") ||
      searchParams.get("nutritionFocus") ||
      searchParams.get("mood") ||
      searchParams.get("week") ||
      searchParams.get("lowFodmap") ||
      searchParams.get("makeAhead") ||
      searchParams.get("ingredientTheme"),
  );

  function handleRecipeSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    const nextParams = new URLSearchParams(searchParams.toString());

    if (query) {
      nextParams.set("q", query);
    } else {
      nextParams.delete("q");
    }

    const nextSearch = nextParams.toString();
    const useRecipeReelJump = shouldUseRecipeReelJump();
    const href = `${nextSearch ? `/recipes?${nextSearch}` : "/recipes"}${
      useRecipeReelJump ? "#first-recipe" : ""
    }`;

    if (pathname === "/recipes") {
      router.replace(href, { scroll: !useRecipeReelJump });
      return;
    }

    router.push(href, { scroll: !useRecipeReelJump });
  }

  function handleClearRecipeSearch() {
    const nextParams = new URLSearchParams(searchParams.toString());

    nextParams.delete("q");

    const nextSearch = nextParams.toString();
    const useRecipeReelJump = shouldUseRecipeReelJump();
    const href = `${nextSearch ? `/recipes?${nextSearch}` : "/recipes"}${
      useRecipeReelJump ? "#home-slide" : ""
    }`;

    if (pathname === "/recipes") {
      router.replace(href, { scroll: !useRecipeReelJump });
      return;
    }

    router.push(href, { scroll: !useRecipeReelJump });
  }

  return (
    <header className={styles.shell}>
      <div className={styles.header}>
        <div className={styles.left}>
          {showBack ? (
            <button
              type="button"
              aria-label="Go back"
              title="Back"
              className={styles.iconButton}
              onClick={handleBack}
            >
              <ArrowLeftIcon />
            </button>
          ) : (
            <span className={styles.spacer} aria-hidden="true" />
          )}

          {showRecipeSearch ? (
            <form className={styles.searchForm} onSubmit={handleRecipeSearch}>
              <div className={styles.searchShell}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.searchIcon}>
                  <path
                    d="m20 20-4.2-4.2M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                  />
                </svg>
                <input
                  key={recipeQuery}
                  type="search"
                  name="q"
                  aria-label="Search recipes"
                  className={styles.searchInput}
                  placeholder="Search recipes"
                  defaultValue={recipeQuery}
                />
                {recipeQuery ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    title="Clear search"
                    className={styles.searchClearButton}
                    onClick={handleClearRecipeSearch}
                  >
                    <XIcon />
                  </button>
                ) : null}
                <button
                  type="submit"
                  aria-label="Search recipes"
                  title="Search recipes"
                  className={styles.searchSubmitButton}
                >
                  <ArrowRightIcon />
                </button>
              </div>
            </form>
          ) : null}
        </div>

        <div className={styles.right}>
          {isRecipeFlow ? (
            <button
              type="button"
              aria-label="Open filters"
              title="Filters"
              className={`${styles.iconButton} ${hasActiveRecipeFilters ? styles.iconButtonActive : ""}`}
              onClick={handleOpenFilters}
            >
              <FilterIcon />
            </button>
          ) : null}

          {!isHomePage ? (
            <Link href="/" aria-label="Home" title="Home" className={styles.iconButton}>
              <HomeIcon />
            </Link>
          ) : null}

          <button
            type="button"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            className={styles.iconButton}
            onClick={toggleTheme}
          >
            <MoonIcon />
          </button>
        </div>
      </div>

      {isRecipeFlow && isFilterOpen ? (
        <div className={styles.filterOverlay} role="presentation">
          <button
            type="button"
            aria-label="Close filters"
            className={styles.filterBackdrop}
            onClick={handleCloseFilters}
          />

          <div
            className={styles.filterStack}
            role="dialog"
            aria-modal="true"
            aria-label="Recipe filters"
            onClick={handleCloseFilters}
          >
            <section className={styles.filterBubbleGroup}>
              <p className={styles.filterLabel}>Meal Type</p>
              <div
                className={styles.filterChips}
                onClick={(event) => event.stopPropagation()}
              >
                {mealTypeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.filterChip} ${
                      filterDraft.mealType === option ? styles.filterChipActive : ""
                    }`}
                    onClick={() => toggleFilterValue("mealType", option)}
                  >
                    {toPascalCase(option)}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.filterBubbleGroup}>
              <p className={styles.filterLabel}>Nutrition Fact</p>
              <div
                className={styles.filterChips}
                onClick={(event) => event.stopPropagation()}
              >
                {nutritionFocusOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.filterChip} ${
                      filterDraft.nutritionFocus === option ? styles.filterChipActive : ""
                    }`}
                    onClick={() => toggleFilterValue("nutritionFocus", option)}
                  >
                    {toPascalCase(option)}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.filterBubbleGroup}>
              <p className={styles.filterLabel}>What Are You In The Mood For?</p>
              <div
                className={styles.filterChips}
                onClick={(event) => event.stopPropagation()}
              >
                {moodOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.filterChip} ${
                      filterDraft.mood === option ? styles.filterChipActive : ""
                    }`}
                    onClick={() => toggleFilterValue("mood", option)}
                  >
                    {toPascalCase(option)}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.filterBubbleGroup}>
              <div
                className={styles.filterActions}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className={`${styles.filterChip} ${styles.filterActionSecondary}`}
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  className={`${styles.filterChip} ${styles.filterActionPrimary}`}
                  onClick={handleApplyFilters}
                >
                  Done
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </header>
  );
}
