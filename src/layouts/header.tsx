import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { MenuProfileSheet } from "./sidebar";

export function Header() {
  return (
    <header className="z-50 ">
      <nav>
        <div className=" max-w-7xl px-3 mx-auto flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2"
            >
              Dan&apos;s Tours
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <MenuProfileSheet />
          </div>
        </div>
      </nav>
    </header>
  );
}
