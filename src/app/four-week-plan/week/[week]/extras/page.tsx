import { notFound } from "next/navigation";
import { FourWeekExtras } from "@/components/four-week-plan";
import { getRecipes } from "@/lib/recipes";

type FourWeekExtrasPageProps = {
  params: Promise<{
    week: string;
  }>;
};

export async function generateStaticParams() {
  return Array.from({ length: 4 }, (_, weekIndex) => ({
    week: String(weekIndex + 1),
  }));
}

export default async function FourWeekExtrasPage({ params }: FourWeekExtrasPageProps) {
  const { week } = await params;
  const weekNumber = Number(week);

  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 4) {
    notFound();
  }

  const recipes = await getRecipes();

  return <FourWeekExtras recipes={recipes} week={weekNumber} />;
}
