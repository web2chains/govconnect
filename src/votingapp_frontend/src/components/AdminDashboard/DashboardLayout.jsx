import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import Footer from "../LandingPage/Footer";
import { cn } from "../../lib/utils";

export function DashboardLayout({ children, className }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main grid area */}
      <div className="flex-1 grid grid-rows-[101px_1fr] lg:grid-cols-[374px_1fr] lg:grid-rows-[101px_1fr]">
        {/* Header */}
        <header className="row-start-1 col-span-full z-20">
          <Header />
        </header>

        {/* Sidebar */}
        <aside className="hidden lg:block row-start-2">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "row-start-2 col-start-1 col-end-[-1] mt-0 px-4 py-6",
            "lg:col-start-2 lg:px-6 lg:py-8",
            className
          )}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-12">
        <Footer />
      </footer>
    </div>
  );
}
