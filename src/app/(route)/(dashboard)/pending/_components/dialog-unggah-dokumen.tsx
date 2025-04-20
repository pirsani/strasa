"use client";
import UpdateDokumenAkhirRiwayatPengajuan from "@/actions/kegiatan/dokumen-akhir/dokumen-akhir";
import InputFileImmediateUpload from "@/components/form/input-file-immediate-upload";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createId } from "@paralleldrive/cuid2";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DialogUnggahDokumenProps {
  buttonVariant?: "default" | "secondary" | "outline";
  onSubmitted?: (kegiatanId: string, riwayatPengajuanId: string) => void;
  riwayatPengajuanId: string;
  kegiatanId: string;
}
export const DialogUnggahDokumen = ({
  buttonVariant = "default",
  riwayatPengajuanId = "",
  kegiatanId = "",
  onSubmitted = () => {},
}: DialogUnggahDokumenProps) => {
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
          <Upload size={18} />
          <span className="hidden sm:block">Unggah Dokumen</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full sm:min-w-[500px]"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Unggah Dokumen</DialogTitle>
          <DialogDescription>Unggah dokumen akhir</DialogDescription>
        </DialogHeader>
        <FormUploadDokumen
          riwayatPengajuanId={riwayatPengajuanId}
          onFormSubmitComplete={hanldeFormSubmitComplete}
          onCancel={handleOnCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

interface FormUploadDokumenProps {
  riwayatPengajuanId: string;
  onFormSubmitComplete?: (isSuccess: boolean) => void;
  onCancel?: () => void;
}
const FormUploadDokumen = ({
  riwayatPengajuanId,
  onFormSubmitComplete = () => {},
  onCancel = () => {},
}: FormUploadDokumenProps) => {
  const cuidDokumentasi = createId();
  const cuidLaporan = createId();
  const cuidDokumenLainnya = createId();
  const handleSimpan = () => {};

  interface dokumens {
    dokumentasi: string | null;
    laporan: string | null;
    lainnya: string | null;
  }

  const [dokumen, setDokumen] = useState<dokumens>({
    dokumentasi: null,
    laporan: null,
    lainnya: null,
  });

  const handleOnUploadComplete = (name: string) => {
    //split name to get the cuid
    const cuid = name.split("_")[1];
    const type = name.split("_")[0];
    if (type === "dokumentasi") {
      setDokumen({ ...dokumen, dokumentasi: cuid });
    } else if (type === "laporan") {
      setDokumen({ ...dokumen, laporan: cuid });
    } else if (type === "lainnya") {
      setDokumen({ ...dokumen, lainnya: cuid });
    }
    console.log(name);
  };

  const handleOnSimpan = async () => {
    const data = {
      riwayatPengajuanId,
      dokumentasi: dokumen.dokumentasi,
      laporan: dokumen.laporan,
      lainnya: dokumen.lainnya,
    };
    const update = await UpdateDokumenAkhirRiwayatPengajuan(data);
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
      <div className="flex flex-col gap-1">
        <label className="block text-sm font-medium text-gray-700">
          Dokumentasi
        </label>
        <InputFileImmediateUpload
          name={"dokumentasi_" + cuidDokumentasi}
          folder={riwayatPengajuanId}
          cuid={cuidDokumentasi}
          onFileUploadComplete={handleOnUploadComplete}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="block text-sm font-medium text-gray-700">
          Laporan Kegiatan
        </label>
        <InputFileImmediateUpload
          name={"laporan_" + cuidLaporan}
          folder={riwayatPengajuanId}
          cuid={cuidLaporan}
          onFileUploadComplete={handleOnUploadComplete}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="block text-sm font-medium text-gray-700">
          Laporan Kegiatan
        </label>
        <InputFileImmediateUpload
          name={"lainnya_" + cuidDokumenLainnya}
          folder={riwayatPengajuanId}
          cuid={cuidDokumenLainnya}
          onFileUploadComplete={handleOnUploadComplete}
        />
      </div>
      <div className="flex flex-row gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Tutup
        </Button>
        <Button onClick={handleOnSimpan}>Simpan</Button>
      </div>
    </div>
  );
};

export default DialogUnggahDokumen;
