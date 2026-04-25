import { notFound } from "next/navigation";
import { FourWeekDay } from "@/components/four-week-plan";
import { getRecipes } from "@/lib/recipes";

type FourWeekDayPageProps = {
  params: Promise<{
    week: string;
    day: string;
  }>;
};

export async function generateStaticParams() {
  return Array.from({ length: 4 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => ({
      week: String(weekIndex + 1),
      day: String(dayIndex + 1),
    })),
  ).flat();
}

export default async function FourWeekDayPage({ params }: FourWeekDayPageProps) {
  const { week, day } = await params;
  const weekNumber = Number(week);
  const dayNumber = Number(day);

  if (
    !Number.isInteger(weekNumber) ||
    !Number.isInteger(dayNumber) ||
    weekNumber < 1 ||
    weekNumber > 4 ||
    dayNumber < 1 ||
    dayNumber > 7
  ) {
    notFound();
  }

  const recipes = await getRecipes();

  return <FourWeekDay recipes={recipes} week={weekNumber} day={dayNumber} />;
}
