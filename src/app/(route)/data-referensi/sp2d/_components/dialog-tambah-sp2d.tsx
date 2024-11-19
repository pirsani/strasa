"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Grid, Plus } from "lucide-react";
import { useEffect } from "react";

interface DialogSp2dProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}
export const DialogSp2d = ({ open, setOpen, children }: DialogSp2dProps) => {
  useEffect(() => {
    setOpen(open);
  }, [open, setOpen]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-36">
          <Plus size={12} />
          <Grid size={18} />
          <span className="hidden sm:block">Sp2d</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full sm:min-w-[500px]"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Sp2d</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan Sp2d baru
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
