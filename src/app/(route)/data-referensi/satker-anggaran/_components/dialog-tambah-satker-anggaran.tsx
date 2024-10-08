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
import { BrickWall, Plus } from "lucide-react";
import { useState } from "react";
import FormSatkerAnggaran from "./form-satker-anggaran";

export const DialogTambahSatkerAnggaran = () => {
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
        <Button className="gap-1 w-48">
          <Plus size={18} />
          <BrickWall size={18} />
          <span className="hidden sm:block">SatkerAnggaran</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px]">
        <DialogHeader>
          <DialogTitle>SatkerAnggaran</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan Unit Kerja Sebagai Satker
            Anggaran baru
          </DialogDescription>
        </DialogHeader>
        <FormSatkerAnggaran
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
