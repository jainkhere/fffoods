import type { Metadata } from "next";
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
