import { FourWeekPlan } from "@/components/four-week-plan";
import { getRecipes } from "@/lib/recipes";

export default async function FourWeekPlanPage() {
  const recipes = await getRecipes();

  return <FourWeekPlan recipes={recipes} />;
}
