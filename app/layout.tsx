import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import "./globals.css";
import {Toaster} from "sonner";

const monaSans = Mona_Sans({
    variable: "--font-mona-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "AI MockMate",
    description: "An AI-powered platform to prepare you for your dream job interviews",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={`${monaSans.className} antialiased pattern`} suppressHydrationWarning>
                {children}

                <Toaster />
            </body>
        </html>
    );
}