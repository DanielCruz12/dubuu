"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteBlogPostMutation } from "@/redux/slices/blog/blog-slice";
import { useLanguage } from "@/lib/i18n-context";

export function BlogDeleteButton({
  postId,
  postTitle,
}: {
  postId: string;
  postTitle: string;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [deletePost, { isLoading: isDeleting }] = useDeleteBlogPostMutation();

  const handleDelete = async () => {
    try {
      await deletePost(postId).unwrap();
      setOpen(false);
      toast.success(t("blog.admin.deleted"));
    } catch (error) {
      console.error("Error al eliminar el artículo:", error);
      toast.error(t("blog.admin.deleteError"));
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label={t("blog.admin.deletePost")}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("blog.admin.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("blog.admin.deleteConfirmMessage").replace(
                "{{title}}",
                postTitle,
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("blog.admin.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting
                ? t("blog.admin.deleting")
                : t("blog.admin.deletePost")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
