"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface MenuProfileSheetProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  dashboardNavItems: {
    title: string;
    href: string;
    icon: React.ReactNode;
  }[];
  pathname: string;
}

export function MenuProfileSheet({
  open,
  setOpen,
  dashboardNavItems,
  pathname,
}: MenuProfileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetTitle></SheetTitle>
        <SheetDescription></SheetDescription>
        <div className="mb-4 flex items-center">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="font-bold">Dan&apos;s Tours</span>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-6">
            {dashboardNavItems.map((item) => {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium",
                    pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.icon}
                  {item.title}
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
