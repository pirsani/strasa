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

interface DialogUnitKerjaProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}
export const DialogUnitKerja = ({
  open,
  setOpen,
  children,
}: DialogUnitKerjaProps) => {
  useEffect(() => {
    setOpen(open);
  }, [open, setOpen]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-36">
          <Plus size={12} />
          <Grid size={18} />
          <span className="hidden sm:block">Unit Kerja</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unit Kerja</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan UnitKerja baru
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
