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
import { Contact, Plus, Signature } from "lucide-react";

interface DialogFormPejabatPerbendaharaanProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children?: React.ReactNode;
}
export const DialogFormPejabatPerbendaharaan = ({
  open,
  setOpen,
  children,
}: DialogFormPejabatPerbendaharaanProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-32">
          <Plus size={18} />
          <Contact size={18} />
          <span className="hidden sm:block">Pejabat</span>
          <Signature className="block sm:hidden" size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[750px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Pejabat Penanggung Jawab Pengelola Keuangan</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan/memperbarui Pejabat Penanggung
            Jawab Pengelola Keuangan
          </DialogDescription>
        </DialogHeader>
        <div className="w-full max-w-full overflow-hidden p-1">{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogFormPejabatPerbendaharaan;
