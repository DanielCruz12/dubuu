"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Menu,
  BookOpen,
  Handshake,
  Facebook,
  Twitter,
  Instagram,
  LinkedinIcon as LinkedIn,
  HelpCircle,
  LogOut,
  Home,
  Bookmark,
  User,
} from "lucide-react";
import Link from "next/link";
import { useClerk, useUser } from "@clerk/nextjs";

export function MenuProfileSheet() {
  const [open, setOpen] = useState(false);
  const { redirectToSignIn, signOut } = useClerk();
  const { user, isLoaded } = useUser();

  const authenticatedMenuItems = [
    { label: "Perfil", icon: User, href: "/profile" },
    { label: "Guardados", icon: Bookmark, href: "/saved" },
    { label: "¿Quieres ser parte?", icon: Handshake, href: "/investment" },
    { label: "Términos y Condiciones", icon: BookOpen, href: "/terms" },
    { label: "Ayuda y Soporte", icon: HelpCircle, href: "/support" },
  ];

  const guestMenuItems = [
    { label: "Inicio", icon: Home, href: "/" },
    { label: "¿Quieres ser parte?", icon: Handshake, href: "/investment" },
    { label: "Términos y Condiciones", icon: BookOpen, href: "/terms" },
    { label: "Ayuda y Soporte", icon: HelpCircle, href: "/support" },
  ];

  const menuToRender =
    isLoaded && user ? authenticatedMenuItems : guestMenuItems;

  const socialIcons = [
    { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
    { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
    { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
    { icon: LinkedIn, label: "LinkedIn", href: "https://linkedin.com" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col justify-between p-0">
        {/* Header */}
        <div className="px-6 pt-6">
          <SheetHeader>
            <SheetTitle>Menú</SheetTitle>
            <SheetDescription />
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 px-6 mt-4">
          <div className="flex flex-col space-y-4 pb-6">
            {isLoaded && user ? (
              <div className="flex items-center space-x-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.imageUrl} alt="User Avatar" />
                  <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col px-2">
                  <span>{user.fullName}</span>
                  <span className="text-muted-foreground">
                    {user.emailAddresses[0].emailAddress}
                  </span>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => {
                  redirectToSignIn();
                  setOpen(false);
                }}
                variant="outline"
              >
                Iniciar sesión
              </Button>
            )}

            <Separator />

            {menuToRender.map((item, index) => (
              <Link key={index} href={item.href}>
                <Button
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </ScrollArea>

        <div className=" px-6 py-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex gap-4">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="icon">
                    <social.icon className="h-5 w-5" />
                    <span className="sr-only">{social.label}</span>
                  </Button>
                </a>
              ))}
            </div>

            {isLoaded && user && (
              <Button
                variant="outline"
                className="w-full max-w-[220px]"
                onClick={async () => {
                  await signOut();
                  setOpen(false);
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
