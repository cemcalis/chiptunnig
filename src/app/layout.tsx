import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Tuning Portal | Premium Dealer Network",
    description: "Advanced ECU Remapping Service for Professionals",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={cn(inter.className, "bg-background text-foreground min-h-screen antialiased")}>
                {children}
            </body>
        </html>
    );
}
