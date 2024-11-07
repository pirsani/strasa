"use client";
import InputFileImmediateUpload from "@/components/form/input-file-immediate-upload";
import { Button } from "@/components/ui/button";
import { createId } from "@paralleldrive/cuid2";
import { useState } from "react";
interface FormPembayaranProps {
  riwayatPengajuanId: string;
}
const FormPembayaran = ({ riwayatPengajuanId }: FormPembayaranProps) => {
  const [cuid, setCuid] = useState<string>(createId());
  const [isUpladed, setIsUploaded] = useState<boolean>(false);
  return (
    <form>
      <div className="flex flex-col gap-2">
        <h1 className="mb-2 font-semibold text-l">Upload Bukti Pembayaran</h1>
        <InputFileImmediateUpload
          name="file"
          folder={riwayatPengajuanId}
          cuid={cuid}
          onFileUploadComplete={() => setIsUploaded(true)}
          onFileChange={() => setIsUploaded(false)}
        />
        <div>
          <Button disabled={!isUpladed} type="button">
            Simpan
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FormPembayaran;
