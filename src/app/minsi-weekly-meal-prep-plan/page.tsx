import type { Metadata } from "next";
import { MealPrepPlan } from "./meal-prep-plan";

export const metadata: Metadata = {
  title: "Minsi's Weekly Meal Prep Plan | FFFoods",
  description: "Minsi's Indian vegetarian weekly menu, grocery list, prep plan, and recipes.",
};

export default function MinsiWeeklyMealPrepPlan() {
  return <MealPrepPlan />;
}
