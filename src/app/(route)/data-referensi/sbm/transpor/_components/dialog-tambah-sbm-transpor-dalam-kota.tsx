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
import FormSbmTransporDalamKotaPulangPergi from "./form-sbm-transpor-dalam-kota";

interface DialogTambahSbmTransporDalamKotaPulangPergiProps {
  buttonVariant?: "default" | "secondary" | "outline";
  KotaId?: string;
}
export const DialogTambahSbmTransporDalamKotaPulangPergi = ({
  buttonVariant = "default",
  KotaId = "",
}: DialogTambahSbmTransporDalamKotaPulangPergiProps) => {
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
        <Button className="gap-1 w-64" variant={buttonVariant}>
          <Plus size={12} />
          <Banknote size={18} />
          <span className="hidden sm:block">SBM Transpor Dalam Kota</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px]">
        <DialogHeader>
          <DialogTitle>SBM Transpor Dalam Kota</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan SBM Transpor DalamKota baru
          </DialogDescription>
        </DialogHeader>
        <FormSbmTransporDalamKotaPulangPergi
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
          //transporDalamKota={sbmTransporDalamKota}
        />
      </DialogContent>
    </Dialog>
  );
};
