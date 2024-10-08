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
import { Banknote, Plus } from "lucide-react";
import { useState } from "react";
import { default as FormSbmUangRepresentasi } from "./form-sbm-uang-representasi";

export const DialogTambahSbmUangRepresentasi = () => {
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
        <Button className="gap-1 w-72">
          <Plus size={18} />
          <Banknote size={18} />
          <span className="hidden sm:block">SBM Uang Representasi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px]">
        <DialogHeader>
          <DialogTitle>SBM Uang Representasi</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan SBM Uang Representasi baru
          </DialogDescription>
        </DialogHeader>
        <FormSbmUangRepresentasi
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
