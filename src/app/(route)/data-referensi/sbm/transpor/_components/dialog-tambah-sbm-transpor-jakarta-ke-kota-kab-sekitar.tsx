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
import FormSbmTransporJakartaKeKotaKabSekitar from "./form-sbm-transpor-jakarta-ke-kota-kab-sekitar";

interface DialogTambahSbmTransporJakartaKeKotaKabSekitarProps {
  buttonVariant?: "default" | "secondary" | "outline";
  KotaId?: string;
}
export const DialogTambahSbmTransporJakartaKeKotaKabSekitar = ({
  buttonVariant = "default",
  KotaId = "",
}: DialogTambahSbmTransporJakartaKeKotaKabSekitarProps) => {
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
        <Button className="gap-1 w-96" variant={buttonVariant}>
          <Plus size={12} />
          <Banknote size={18} />
          <span className="hidden sm:block">
            SBM Transpor Jakarta Ke Kota Kab Sekitar
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full sm:min-w-[500px]">
        <DialogHeader>
          <DialogTitle>SBM Transpor Jakarta Ke Kota Kab Sekitar</DialogTitle>
          <DialogDescription>
            Isi form di bawah untuk menambahkan SBM baru
          </DialogDescription>
        </DialogHeader>
        <FormSbmTransporJakartaKeKotaKabSekitar
          onCancel={onCancel}
          handleFormSubmitComplete={handleFormSubmitComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
