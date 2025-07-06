/* eslint-disable @next/next/no-img-element */
"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Copy,
  Mail,
  Code,
  MoreHorizontal,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  MessageSquare,
} from "lucide-react";
import { ReusableDialog } from "@/components/reusable-dialog";
import { useState } from "react";

interface ShareOption {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  color?: string;
}

interface ShareModalProps {
  title: string;
  url: string;
  description?: string;
  image?: string;
}

export function ShareModal({
  title,
  url,
  description,
  image,
}: ShareModalProps) {
  const [open, setOpen] = useState(false);

  const shareOptions: ShareOption[] = [
    {
      name: "Copiar enlace",
      icon: <Copy className="w-6 h-6" />,
      action: () => {
        navigator.clipboard.writeText(url);
        alert("Enlace copiado al portapapeles");
      },
    },
    {
      name: "Email",
      icon: <Mail className="w-6 h-6" />,
      action: () => {
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
        );
      },
    },

    {
      name: "WhatsApp",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "text-green-600",
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(title + ": " + url)}`
        );
      },
    },

    {
      name: "Facebook",
      icon: <Facebook className="w-6 h-6" />,
      color: "text-blue-700",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        );
      },
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-6 h-6" />,
      color: "text-blue-400",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
        );
      },
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-6 h-6" />,
      color: "text-pink-600",
      action: () => {
        // Instagram doesn't have direct sharing, so we copy the link
        navigator.clipboard.writeText(url);
        alert("Enlace copiado. Puedes pegarlo en Instagram Stories");
      },
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-6 h-6" />,
      color: "text-blue-800",
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        );
      },
    },
    {
      name: "Telegram",
      icon: <Send className="w-6 h-6" />,
      color: "text-blue-500",
      action: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        );
      },
    },
    {
      name: "Insertar",
      icon: <Code className="w-6 h-6" />,
      action: () => {
        const embedCode = `<iframe src="${url}" width="100%" height="500" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(embedCode);
        alert("Código de inserción copiado al portapapeles");
      },
    },
    {
      name: "Más opciones",
      icon: <MoreHorizontal className="w-6 h-6" />,
      action: () => {
        if (navigator.share) {
          navigator
            .share({
              title: title,
              text: description || title,
              url: url,
            })
            .catch((error) => console.log("Error sharing", error));
        } else {
          alert("Compartir no está disponible en este navegador");
        }
      },
    },
  ];

  return (
    <ReusableDialog
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full p-2"
        >
          <Share2 className="h-4 w-4 " />
          <span className="text-sm font-medium underline">Compartir</span>
        </Button>
      }
      title="Comparte este espacio"
      description={description}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          {image && (
            <img
              src={image || "/placeholder.svg?height=80&width=80"}
              alt={title}
              className="w-20 h-20 object-cover rounded-md"
            />
          )}
          <div className="flex-1">
            <h3 className="font-medium text-base">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1 md:line-clamp-none line-clamp-3">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="outline"
              className="flex items-center justify-start h-12 gap-3 hover:bg-muted text-left p-4"
              onClick={() => {
                option.action();
                if (option.name !== "Más opciones") {
                  setOpen(false);
                }
              }}
            >
              <span className={`${option.color || "text-gray-600"}`}>
                {option.icon}
              </span>
              <span className="text-sm font-medium">{option.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </ReusableDialog>
  );
}
