import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { Sidebar } from "./components/sidebar";
import { AssignmentTabs } from "./components/assignment-tabs";
import { DemoNavigator } from "./components/demo-navigator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduCaitors Grading",
  description: "AI-assisted grading platform for educators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-background text-foreground antialiased`}>
        <Providers>
           <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 md:ml-20 relative flex flex-col pb-16 md:pb-0">
                 <AssignmentTabs />
                 <div className="flex-1 overflow-auto">
                   {children}
                 </div>
              </main>
           </div>
           <DemoNavigator />
        </Providers>
      </body>
    </html>
  );
}
