import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";

export function DashboardHeader() {
  return (
    <header className="z-50 px-3 md:px-0">
      <nav>
        <div className=" max-w-7xl mx-auto flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/home"
              className="text-xl font-bold flex items-center gap-2"
            >
              Dan&apos;s Tours
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
