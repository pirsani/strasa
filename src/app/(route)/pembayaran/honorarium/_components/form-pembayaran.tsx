"use client";
import { updateBuktiPembayaranHonorarium } from "@/actions/honorarium/narasumber/proses-pengajuan-pembayaran";
import InputFileImmediateUpload from "@/components/form/input-file-immediate-upload";
import { Button } from "@/components/ui/button";
import { createId } from "@paralleldrive/cuid2";
import { useState } from "react";
import { toast } from "sonner";
interface FormPembayaranProps {
  riwayatPengajuanId: string;
}
const FormPembayaran = ({ riwayatPengajuanId }: FormPembayaranProps) => {
  const [cuid, setCuid] = useState<string>(createId());
  const [isUpladed, setIsUploaded] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const handleSimpanPembayaran = async () => {
    setIsSubmitting(true);
    const res = await updateBuktiPembayaranHonorarium(riwayatPengajuanId, cuid);
    if (res.success) {
      toast.success("Bukti pembayaran berhasil diupload");
    } else {
      toast.error("Gagal mengupload bukti pembayaran");
    }
    setIsSubmitting(false);
  };
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
          <Button
            disabled={!isUpladed || isSubmitting}
            type="button"
            onClick={handleSimpanPembayaran}
          >
            Simpan {isSubmitting && "..."}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FormPembayaran;
