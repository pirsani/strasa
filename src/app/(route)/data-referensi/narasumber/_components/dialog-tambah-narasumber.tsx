import FormNarasumber from "@/components/form/form-narasumber";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Narasumber } from "@/zod/schemas/narasumber";
import { GraduationCap, Plus } from "lucide-react";
import { useState } from "react";

interface DialogTambahNarasumberProps {
  buttonVariant?: "default" | "secondary" | "outline";
}
const DialogTambahNarasumber = ({
  buttonVariant = "default",
}: DialogTambahNarasumberProps) => {
  const [open, setOpen] = useState(false);
  const onCancel = () => {
    setOpen(false);
  };

  // Type guard to check if a value is a Date object
  const isDate = (value: any): value is Date => value instanceof Date;

  const handleOnSaveSuccess = (data: Narasumber) => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-44" variant={buttonVariant}>
          <Plus size={12} />
          <GraduationCap size={18} />
          <span className="hidden sm:block">Narasumber</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[750px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Narasumber</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan narasumber baru
          </DialogDescription>
        </DialogHeader>
        <FormNarasumber
          onCancel={onCancel}
          onSaveSuccess={handleOnSaveSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DialogTambahNarasumber;
