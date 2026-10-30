"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useGetUnreadCountQuery } from "@/redux/slices/messaging/messaging-slice";

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
  const { user } = useUser();
  const { data: unread } = useGetUnreadCountQuery(undefined, {
    skip: !user?.id,
  });
  const unreadCount = unread?.unreadCount ?? 0;

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
      <SheetContent side="left" className="w-[250px] pr-0">        <SheetTitle></SheetTitle>
        <SheetDescription></SheetDescription>
        <div className="mb-4 flex items-center">
          <Image src="/logo.svg" priority alt="Dubuu Logo" width={80} height={20} />
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 ">
          <div className="flex flex-col space-y-6">
            {dashboardNavItems.map((item) => {
              const showUnread =
                item.href.endsWith("/messages") && unreadCount > 0;
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
                  {showUnread && (
                    <Badge className="ml-auto mr-6 h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
