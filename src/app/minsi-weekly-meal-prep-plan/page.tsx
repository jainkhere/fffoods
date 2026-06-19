import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Minsi's Weekly Meal Prep Plan | FFFoods",
  description: "A practical, plant-forward weekly meal prep plan for Minsi.",
};

const prepSteps = [
  { time: "0:00", title: "Start the slow things", detail: "Cook the porridge base and roast the roots." },
  { time: "0:15", title: "Blend & simmer", detail: "Make muhammara and put the soup on." },
  { time: "0:35", title: "Chop the fresh bits", detail: "Wash greens and prep crunchy salad vegetables." },
  { time: "0:55", title: "Portion & reset", detail: "Fill containers, label them, and leave Wednesday flexible." },
];

const days = [
  {
    day: "Monday",
    note: "Fresh start",
    meals: [
      ["Breakfast", "Super Seedy Breakfast Porridge", "super-seedy-breakfast-porridge"],
      ["Lunch", "The Daily Salad + roasted roots", "the-daily-salad"],
      ["Dinner", "Plant-Powered Polenta Ragu", "plant-powered-polenta-ragu"],
    ],
  },
  {
    day: "Tuesday",
    note: "Grab & go",
    meals: [
      ["Breakfast", "Superfood Smoothie", "superfood-smoothie-with-bowl-option"],
      ["Lunch", "Wild Biome Super Soup", "wild-biome-super-soup"],
      ["Dinner", "Tempeh Tacos", "tempeh-tacos-and-taco-salad"],
    ],
  },
  {
    day: "Wednesday",
    note: "Use what’s open",
    meals: [
      ["Breakfast", "Porridge + crispy oat granola", "crispy-oat-granola"],
      ["Lunch", "Muhammara Sandwich", "muhammara-sandwich"],
      ["Dinner", "Leftovers night", null],
    ],
  },
  {
    day: "Thursday",
    note: "Midweek lift",
    meals: [
      ["Breakfast", "Berry Good Sweet Potato Toast", "berry-good-sweet-potato-toast"],
      ["Lunch", "Down 'n' Dirty Kale Salad", "down-n-dirty-kale-salad"],
      ["Dinner", "Back-Pocket Stir-Fry", "back-pocket-stir-fry"],
    ],
  },
  {
    day: "Friday",
    note: "Easy finish",
    meals: [
      ["Breakfast", "Creamy Coconut Pudding", "creamy-coconut-pudding-with-pineapple"],
      ["Lunch", "Soup + muhammara dip", "muhammara-dip"],
      ["Dinner", "Pesto Pasta", "pesto-pasta"],
    ],
  },
  {
    day: "Saturday",
    note: "Cook something fun",
    meals: [
      ["Breakfast", "Gluten-Free Pancakes", "gluten-free-pancakes"],
      ["Lunch", "Taco salad remix", "tempeh-tacos-and-taco-salad"],
      ["Dinner", "Mushroom Risotto", "mushroom-risotto"],
    ],
  },
  {
    day: "Sunday",
    note: "Reset & restore",
    meals: [
      ["Breakfast", "Smoothie bowl", "superfood-smoothie-with-bowl-option"],
      ["Lunch", "Clean-out-the-fridge salad", "the-daily-salad"],
      ["Dinner", "Nourishing Tomato Noodle Soup", "nourishing-tomato-noodle-soup"],
    ],
  },
] as const;

const shoppingGroups = [
  { icon: "🥬", label: "Fresh", items: "Leafy greens, sweet potatoes, mushrooms, lemons, ginger, crunchy veg" },
  { icon: "🫘", label: "Protein", items: "Tempeh, tofu, lentils, seeds, nuts" },
  { icon: "🥫", label: "Pantry", items: "Oats, polenta, pasta, coconut milk, tinned tomatoes, spices" },
  { icon: "✨", label: "Finishing", items: "Fresh herbs, pesto, muhammara, oat granola" },
];

export default function MinsiWeeklyMealPrepPlan() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>A calm week of good food</p>
            <h1>Minsi&apos;s weekly meal prep plan</h1>
            <p className={styles.summary}>
              One focused prep session, plenty of flexible leftovers, and a full
              week of plant-forward meals ready when you are.
            </p>
          </div>
          <div className={styles.heroBadge} aria-label="Plan details">
            <span>7</span>
            <p>days planned</p>
            <small>about 75 min prep</small>
          </div>
        </section>

        <section className={styles.prepSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>Sunday game plan</p>
              <h2>Prep once, coast all week</h2>
            </div>
            <p>Keep it loose—the goal is a helpful head start, not a kitchen marathon.</p>
          </div>
          <ol className={styles.timeline}>
            {prepSteps.map((step) => (
              <li key={step.time}>
                <span className={styles.time}>{step.time}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>The week</p>
              <h2>What&apos;s on the menu</h2>
            </div>
            <p>Tap any named meal to open its full recipe.</p>
          </div>
          <div className={styles.dayGrid}>
            {days.map((day, index) => (
              <article className={styles.dayCard} key={day.day}>
                <div className={styles.dayHeader}>
                  <div className={styles.dayNumber}>{String(index + 1).padStart(2, "0")}</div>
                  <div>
                    <h3>{day.day}</h3>
                    <p>{day.note}</p>
                  </div>
                </div>
                <div className={styles.meals}>
                  {day.meals.map(([type, meal, recipeId]) => (
                    <div className={styles.meal} key={`${type}-${meal}`}>
                      <span>{type}</span>
                      {recipeId ? <Link href={`/recipes/${recipeId}`}>{meal}</Link> : <p>{meal}</p>}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.shoppingSection}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>Shopping shortcut</p>
              <h2>Build the basket</h2>
            </div>
          </div>
          <div className={styles.shoppingGrid}>
            {shoppingGroups.map((group) => (
              <article key={group.label}>
                <span className={styles.shoppingIcon}>{group.icon}</span>
                <h3>{group.label}</h3>
                <p>{group.items}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
