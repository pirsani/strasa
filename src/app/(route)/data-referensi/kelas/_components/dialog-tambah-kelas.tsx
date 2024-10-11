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
import { useState } from "react";
import FormKelas from "./form-kelas";

interface DialogTambahKelasProps {
  buttonVariant?: "default" | "secondary" | "outline";
  kegiatanId?: string;
}
export const DialogTambahKelas = ({
  buttonVariant = "default",
  kegiatanId = "",
}: DialogTambahKelasProps) => {
  const [open, setOpen] = useState(false);

  const onCancel = () => {
    setOpen(false);
  };

  // Closes the dialog if the form submission is successful
  const handleFormSubmitComplete = (isSuccess: Boolean) => {
    if (isSuccess) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 w-28" variant={buttonVariant}>
          <Plus size={12} />
          <Grid size={18} />
          <span className="hidden sm:block">Kelas</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kelas</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan Kelas baru
          </DialogDescription>
        </DialogHeader>
        <FormKelas
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
          kegiatanId={kegiatanId}
        />
      </DialogContent>
    </Dialog>
  );
};
