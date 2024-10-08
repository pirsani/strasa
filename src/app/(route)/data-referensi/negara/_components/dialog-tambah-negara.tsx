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
import { Flag, Plus } from "lucide-react";
import { useState } from "react";
import FormNegara from "./form-negara";

export const DialogTambahNegara = () => {
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
        <Button className="gap-1 w-36">
          <Plus size={18} />
          <Flag size={18} />
          <span className="hidden sm:block">Negara</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Negara</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan Negara baru
          </DialogDescription>
        </DialogHeader>
        <FormNegara
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
