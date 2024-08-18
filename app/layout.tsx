import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from './context/SidebarContext';
import Main from "./components/Main";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "yogesh0509",
  description: "Portfolio Website"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <SidebarProvider>
          <Main>
            {children}
          </Main>
        </SidebarProvider>
      </body>
    </html>
  );
}
