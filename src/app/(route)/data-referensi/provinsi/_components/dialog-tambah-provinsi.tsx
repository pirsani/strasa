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
import { MapPinned, Plus } from "lucide-react";
import { useState } from "react";
import FormProvinsi from "./form-provinsi";

export const DialogTambahProvinsi = () => {
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
          <MapPinned size={18} />
          <span className="hidden sm:block">Provinsi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Provinsi</DialogTitle>
          <DialogDescription>
            <p>Isi form di bawah untuk menambahkan Provinsi baru</p>
            <p>
              Kode Provinsi merujuk kodefikasi yang dikeluarkan oleh kemendagri
            </p>
          </DialogDescription>
        </DialogHeader>
        <FormProvinsi
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
