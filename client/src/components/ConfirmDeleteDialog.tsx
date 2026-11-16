import React, { useState } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ConfirmDeleteDialogProps {
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  confirmText?: string;
  cancelText?: string;
  trigger?: React.ReactNode;
  triggerTooltip?: string;
  triggerClassName?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConfirmDeleteDialog({
  title,
  description,
  onConfirm,
  confirmText = "Delete",
  cancelText = "Cancel",
  trigger,
  triggerTooltip,
  triggerClassName,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
}: ConfirmDeleteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
    } catch {
      // Error handled by onConfirm caller
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors",
              triggerClassName
            )}
            title={triggerTooltip || title}
            disabled={disabled}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="sm:max-w-[420px] border-border/80 bg-card text-card-foreground shadow-xl rounded-2xl"
      >
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-500 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={loading}
              className="border-border"
            >
              {cancelText}
            </Button>
          </DialogClose>

          <Button
            onClick={handleConfirm}
            disabled={loading || disabled}
            variant="destructive"
            className="gap-2 cursor-pointer shadow-md"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            <span>{confirmText}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;
