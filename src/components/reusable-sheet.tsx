import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "./ui/scroll-area";

export function ReviewSheet({
  triggerText,
  children,
}: {
  triggerText: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger>
        <small className="underline hover:cursor-pointer">
          {triggerText}
        </small>
      </SheetTrigger>
      <SheetContent side={"left"} className="w-full sm:max-w-[450px]">
        <SheetHeader>
          <SheetTitle>Comentarios</SheetTitle>
          <SheetDescription>
            Opiniones verificadas de nuestros clientes.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="mt-4 h-[80vh] pr-4">{children}</ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
