import type { Metadata } from "next";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

export const metadata: Metadata = {
  title: "Collab Docs",
  description: "A lightweight collaborative document editor",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [users, currentUserId] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    getCurrentUserId(),
  ]);

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppHeader users={users} currentUserId={currentUserId} />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
