"use client";
import { verifikasiDokumenAkhir } from "@/actions/kegiatan/dokumen-akhir/verifikasi-dokumen-akhir";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BookCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DialogVerifikasiDokumenAkhirProps {
  buttonVariant?: "default" | "secondary" | "outline";
  onSubmitted?: (kegiatanId: string, riwayatPengajuanId: string) => void;
  riwayatPengajuanId: string;
  kegiatanId: string;
}
export const DialogVerifikasiDokumenAkhir = ({
  buttonVariant = "default",
  riwayatPengajuanId = "",
  kegiatanId = "",
  onSubmitted = () => {},
}: DialogVerifikasiDokumenAkhirProps) => {
  const [open, setOpen] = useState(false);

  const onCancel = () => {
    setOpen(false);
  };

  // Closes the dialog if the form submission is successful
  const hanldeFormSubmitComplete = (isSuccess: boolean) => {
    if (isSuccess) {
      setOpen(false);
      onSubmitted(kegiatanId, riwayatPengajuanId);
    }
  };

  const handleOnCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1" variant={buttonVariant} size={"sm"}>
          <BookCheck size={18} />
          <span className="hidden sm:block">Verifikasi</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full sm:min-w-[500px]"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Verifikasi</DialogTitle>
          <DialogDescription>Verfikasi dokumen akhir</DialogDescription>
        </DialogHeader>
        <FormVerfikasiDokumenAkhir
          riwayatPengajuanId={riwayatPengajuanId}
          onFormSubmitComplete={hanldeFormSubmitComplete}
          onCancel={handleOnCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

interface FormVerfikasiDokumenAkhirProps {
  riwayatPengajuanId: string;
  onFormSubmitComplete?: (isSuccess: boolean) => void;
  onCancel?: () => void;
}
const FormVerfikasiDokumenAkhir = ({
  riwayatPengajuanId,
  onFormSubmitComplete = () => {},
  onCancel = () => {},
}: FormVerfikasiDokumenAkhirProps) => {
  const [isChecked, setIsChecked] = useState(false);
  interface dokumens {
    dokumentasi: string | null;
    laporan: string | null;
  }

  const [dokumen, setDokumen] = useState<dokumens>({
    dokumentasi: null,
    laporan: null,
  });

  const handleOnSimpan = async () => {
    const update = await verifikasiDokumenAkhir(riwayatPengajuanId);
    if (update.success) {
      toast.success(update.message);
      onFormSubmitComplete(true);
    } else {
      toast.error(update.message);
      onFormSubmitComplete(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Input
          id={riwayatPengajuanId}
          type="checkbox"
          size={12}
          className="p-2 m-2 w-1/6"
          onChange={(e) => setIsChecked(e.target.checked)}
        />
        <label htmlFor={riwayatPengajuanId}>
          Semua dokumen lengkap dan telah diperiksa dan dinyatakan benar
        </label>
      </div>
      <div className="flex flex-row gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Tutup
        </Button>
        <Button onClick={handleOnSimpan} disabled={!isChecked}>
          Simpan dan Selesai
        </Button>
      </div>
    </div>
  );
};

export default DialogVerifikasiDokumenAkhir;
