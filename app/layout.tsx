import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arcadia — Private coastal stays",
  description:
    "Exclusive coastal villas and private luxury stays, considered down to the last sun-warmed stone.",
  icons: {
    icon: "favicon.svg",
    shortcut: "favicon.svg",
  },
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
