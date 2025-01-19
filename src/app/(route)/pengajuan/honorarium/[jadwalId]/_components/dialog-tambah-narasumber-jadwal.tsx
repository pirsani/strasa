"use client";
import { OptionSbm } from "@/actions/sbm";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Decimal from "decimal.js";
import { Plus } from "lucide-react";
import { useState } from "react";
import FormTambahNarasumberJadwal from "./form-tambah-narasumber-jadwal";

interface DialogTambahNarasumberJadwalProps {
  kegiatanId: string;
  jadwalId: string;
  jumlahJamPelajaran: number | Decimal | null;
  optionsSbmHonorarium: OptionSbm[];
}

export function DialogTambahNarasumberJadwal({
  kegiatanId,
  jadwalId,
  jumlahJamPelajaran,
  optionsSbmHonorarium,
}: DialogTambahNarasumberJadwalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false); // Close the dialog on cancel
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus size={14} /> <span>Tambah Narasumber</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px] md:max-w-lg"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Tambah Narasumber</DialogTitle>
          <DialogDescription>
            Pilih narasumber yang akan ditambahkan ke jadwal ini. kemudian klik
            simpan
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormTambahNarasumberJadwal
            kegiatanId={kegiatanId}
            jadwalId={jadwalId}
            jumlahJamPelajaran={jumlahJamPelajaran}
            optionsSbmHonorarium={optionsSbmHonorarium}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DialogTambahNarasumberJadwal;
