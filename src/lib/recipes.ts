import { readFile } from "node:fs/promises";
import path from "node:path";
import { filterRecipes, matchesRecipeSearch, type RecipeFilters } from "@/lib/recipe-filters";

export const recipeSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Recipe",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "title",
    "mealType",
    "plantPoints",
    "tags",
    "lowFodmap",
    "fibrePercent",
    "carbPercent",
    "proteinPercent",
    "ingredients",
    "instructions",
    "notes",
  ],
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    week: { type: "integer" },
    day: { type: "integer" },
    mealType: { type: "string" },
    plantPoints: { type: "integer" },
    tags: {
      type: "array",
      items: { type: "string" },
    },
    lowFodmap: { type: "boolean" },
    fibrePercent: { type: "number" },
    carbPercent: { type: "number" },
    proteinPercent: { type: "number" },
    descriptiveNote: { type: "string" },
    ingredients: {
      type: "array",
      items: { type: "string" },
    },
    instructions: {
      type: "array",
      items: { type: "string" },
    },
    notes: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

export type Recipe = {
  id: string;
  title: string;
  week?: number;
  day?: number;
  mealType: string;
  plantPoints: number;
  tags: string[];
  lowFodmap: boolean;
  fibrePercent: number;
  carbPercent: number;
  proteinPercent: number;
  descriptiveNote?: string;
  ingredients: string[];
  instructions: string[];
  notes: string[];
};

type RecipeData = Recipe | Recipe[];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRecipe(value: unknown): value is Recipe {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Recipe>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    (typeof candidate.week === "undefined" || Number.isInteger(candidate.week)) &&
    (typeof candidate.day === "undefined" || Number.isInteger(candidate.day)) &&
    typeof candidate.mealType === "string" &&
    Number.isInteger(candidate.plantPoints) &&
    isStringArray(candidate.tags) &&
    typeof candidate.lowFodmap === "boolean" &&
    typeof candidate.fibrePercent === "number" &&
    typeof candidate.carbPercent === "number" &&
    typeof candidate.proteinPercent === "number" &&
    (typeof candidate.descriptiveNote === "undefined" ||
      typeof candidate.descriptiveNote === "string") &&
    isStringArray(candidate.ingredients) &&
    isStringArray(candidate.instructions) &&
    isStringArray(candidate.notes)
  );
}

async function readRecipeData(): Promise<RecipeData> {
  const filePath = path.join(process.cwd(), "data", "recipes.json");
  const fileContents = await readFile(filePath, "utf8");
  const parsed = JSON.parse(fileContents) as unknown;

  if (Array.isArray(parsed)) {
    if (!parsed.every(isRecipe)) {
      throw new Error("Invalid recipes.json: one or more recipes do not match the schema.");
    }

    return parsed;
  }

  if (!isRecipe(parsed)) {
    throw new Error("Invalid recipes.json: recipe does not match the schema.");
  }

  return parsed;
}

export async function getRecipes(): Promise<Recipe[]> {
  const data = await readRecipeData();
  return Array.isArray(data) ? data : [data];
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const recipes = await getRecipes();
  return recipes.find((recipe) => recipe.id === id);
}

export function getRecipesForWeekDay(
  recipes: Recipe[],
  week: number,
  day: number,
): Recipe[] {
  return recipes
    .filter((recipe) => recipe.week === week && recipe.day === day)
    .sort((left, right) => left.mealType.localeCompare(right.mealType));
}

export const mealTypeOrder = [
  "breakfast",
  "lunch",
  "dinner",
  "side",
  "topping",
  "snacks",
  "drinks",
  "dessert",
] as const;

export function sortRecipesByMealType(recipes: Recipe[]): Recipe[] {
  return [...recipes].sort((left, right) => {
    const leftIndex = mealTypeOrder.indexOf(left.mealType as (typeof mealTypeOrder)[number]);
    const rightIndex = mealTypeOrder.indexOf(right.mealType as (typeof mealTypeOrder)[number]);

    if (leftIndex === rightIndex) {
      return left.title.localeCompare(right.title);
    }

    if (leftIndex === -1) {
      return 1;
    }

    if (rightIndex === -1) {
      return -1;
    }

    return leftIndex - rightIndex;
  });
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const recipes = await getRecipes();
  return recipes.filter((recipe) => matchesRecipeSearch(recipe, query));
}

export { filterRecipes, matchesRecipeSearch };
export type { RecipeFilters };
