import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipe-detail";
import { getRecipe, getRecipes } from "@/lib/recipes";

type RecipePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  const recipes = await getRecipes();

  return recipes.map((recipe) => ({
    id: recipe.id,
  }));
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    return {
      title: "Recipe Not Found | FFFoods",
    };
  }

  return {
    title: `${recipe.title} | FFFoods`,
    description: `${typeof recipe.week === "number" ? `Week ${recipe.week}` : "Recipe"}${
      typeof recipe.day === "number" ? `, day ${recipe.day}` : ""
    }, ${recipe.mealType} recipe.`,
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipes = await getRecipes();
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  return <RecipeDetail recipe={recipe} recipes={recipes} />;
}
