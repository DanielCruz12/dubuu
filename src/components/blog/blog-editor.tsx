"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Image as ImageIcon,
  TextQuote,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function ToolbarButton({
  editor,
  title,
  onClick,
  isActive,
  disabled,
  children,
}: {
  editor: Editor | null;
  title: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      aria-label={title}
      disabled={disabled || !editor}
      onClick={onClick}
      className={cn(
        "h-8 w-8 shrink-0 rounded-lg",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Button>
  );
}

function UrlPopover({
  editor,
  title,
  icon,
  placeholder,
  initialValue,
  onApply,
}: {
  editor: Editor | null;
  title: string;
  icon: React.ReactNode;
  placeholder: string;
  initialValue?: string;
  onApply: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(initialValue ?? "");

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setUrl(initialValue ?? "");
      }}
    >
      <PopoverTrigger asChild>
        <span className="inline-flex">
          <ToolbarButton editor={editor} title={title} onClick={() => setOpen(true)}>
            {icon}
          </ToolbarButton>
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!url.trim()) return;
            onApply(url.trim());
            setOpen(false);
          }}
        >
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
          <Button type="submit" size="sm">
            OK
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const setLink = (url: string) => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-border/50 bg-muted/40 p-2"
      role="toolbar"
      aria-label="Formato del artículo"
    >
      <ToolbarButton
        editor={editor}
        title="Título 1"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor?.isActive("heading", { level: 1 })}
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Título 2"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor?.isActive("heading", { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Título 3"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor?.isActive("heading", { level: 3 })}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton
        editor={editor}
        title="Negrita"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        isActive={editor?.isActive("bold")}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Cursiva"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        isActive={editor?.isActive("italic")}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Subrayado"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        isActive={editor?.isActive("underline")}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton
        editor={editor}
        title="Lista con viñetas"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        isActive={editor?.isActive("bulletList")}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Lista numerada"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        isActive={editor?.isActive("orderedList")}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Cita"
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        isActive={editor?.isActive("blockquote")}
      >
        <TextQuote className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton
        editor={editor}
        title="Alinear a la izquierda"
        onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        isActive={editor?.isActive({ textAlign: "left" })}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Centrar"
        onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        isActive={editor?.isActive({ textAlign: "center" })}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Alinear a la derecha"
        onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        isActive={editor?.isActive({ textAlign: "right" })}
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Justificar"
        onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
        isActive={editor?.isActive({ textAlign: "justify" })}
      >
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <UrlPopover
        editor={editor}
        title="Insertar enlace"
        icon={<Link2 className="h-4 w-4" />}
        placeholder="https://…"
        initialValue={editor?.getAttributes("link").href ?? ""}
        onApply={setLink}
      />
      <UrlPopover
        editor={editor}
        title="Insertar imagen"
        icon={<ImageIcon className="h-4 w-4" />}
        placeholder="https://…/imagen.jpg"
        onApply={(src) =>
          editor?.chain().focus().setImage({ src }).run()
        }
      />

      <span className="mx-1 h-5 w-px bg-border" aria-hidden />

      <ToolbarButton
        editor={editor}
        title="Deshacer"
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={!editor?.can().chain().focus().undo().run()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        editor={editor}
        title="Rehacer"
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={!editor?.can().chain().focus().redo().run()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function BlogEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
    ],
    content: value || undefined,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[300px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // El contenido inicial puede llegar después del montaje (modo editar).
  useEffect(() => {
    if (editor && value && editor.isEmpty) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
