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
import FormKro from "./form-kro";

interface DialogTambahKroProps {
  buttonVariant?: "default" | "secondary" | "outline";
}
export const DialogTambahKro = ({
  buttonVariant = "default",
}: DialogTambahKroProps) => {
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
        <Button className="gap-1 w-28" variant={buttonVariant}>
          <Plus size={12} />
          <Grid size={18} />
          <span className="hidden sm:block">Kro</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kro</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan Kro baru
          </DialogDescription>
        </DialogHeader>
        <FormKro
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
