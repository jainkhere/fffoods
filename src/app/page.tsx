import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Fibre Fueled Foods</p>
          <h1>Choose your experience</h1>
          <p className={styles.summary}>
            Jump into the structured four-week gut reset plan or browse the full
            recipe library directly.
          </p>
        </section>

        <section className={styles.grid}>
          <Link href="/four-week-plan" className={styles.card}>
            <p className={styles.cardLabel}>Guided plan</p>
            <h2>4 Week Gut Reset Plan</h2>
            <p>
              Open the week-by-week calendar and drill into each planned day.
            </p>
          </Link>

          <Link href="/recipes" className={styles.card}>
            <p className={styles.cardLabel}>Browse freely</p>
            <h2>All Recipes</h2>
            <p>
              Search, filter, and open every recipe without following the plan.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}
