import FormPeserta from "@/app/(route)/data-referensi/peserta/_components/form-peserta";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Peserta } from "@/zod/schemas/peserta";
import { Plus, UsersRound } from "lucide-react";
import { useState } from "react";

interface DialogTambahPesertaProps {
  buttonVariant?: "default" | "secondary" | "outline";
}
const DialogTambahPeserta = ({
  buttonVariant = "default",
}: DialogTambahPesertaProps) => {
  const [open, setOpen] = useState(false);
  const onCancel = () => {
    setOpen(false);
  };

  // Type guard to check if a value is a Date object
  const isDate = (value: any): value is Date => value instanceof Date;

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    event.preventDefault(); // Prevent the default behavior of closing the dialog
  };

  const handleOnSaveSuccess = (data: Peserta) => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-44" variant={buttonVariant}>
          <Plus size={12} />
          <UsersRound size={18} />
          <span className="hidden sm:block">Peserta</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        onEscapeKeyDown={handleEscapeKeyDown}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="w-full sm:min-w-[750px] max-h-[90vh] overflow-auto"
      >
        <DialogHeader>
          <DialogTitle>Peserta</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan peserta baru
          </DialogDescription>
        </DialogHeader>
        <FormPeserta onCancel={onCancel} onSaveSuccess={handleOnSaveSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default DialogTambahPeserta;
