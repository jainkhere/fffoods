import type { Metadata } from "next";
import { Suspense } from "react";
import { AppHeader } from "@/components/app-header";
import styles from "./layout.module.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FFFoods",
  description: "Recipe viewer backed by local Fibre Fueled Foods data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const storedTheme = window.localStorage.getItem("theme");
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const theme = storedTheme ?? (prefersDark ? "dark" : "light");
                  document.documentElement.dataset.theme = theme;
                } catch {}
              })();
            `,
          }}
        />
      </head>
      <body className={styles.body}>
        <Suspense fallback={null}>
          <AppHeader />
        </Suspense>
        <div className={styles.content}>{children}</div>
      </body>
    </html>
  );
}
