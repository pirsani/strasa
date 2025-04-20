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
import { BookOpen, Plus } from "lucide-react";
import { useState } from "react";
import FormMateri from "./form-materi";

interface DialogTambahMateriProps {
  buttonVariant?: "default" | "secondary" | "outline";
}
export const DialogTambahMateri = ({
  buttonVariant = "default",
}: DialogTambahMateriProps) => {
  const [open, setOpen] = useState(false);

  const onCancel = () => {
    setOpen(false);
  };

  // Closes the dialog if the form submission is successful
  const handleFormSubmitComplete = (isSuccess: boolean) => {
    if (isSuccess) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-32" variant={buttonVariant}>
          <Plus size={12} />
          <BookOpen size={18} />
          <span className="hidden sm:block">Materi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Materi</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan Materi baru
          </DialogDescription>
        </DialogHeader>
        <FormMateri
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
