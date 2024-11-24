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
  const [filenameBuktiPembayaran, setFilenameBuktiPembayaran] = useState<
    string | null
  >(null);
  const [isUpladed, setIsUploaded] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const handleSimpanPembayaran = async () => {
    if (!filenameBuktiPembayaran) {
      toast.error("Bukti pembayaran belum diupload");
      return;
    }
    setIsSubmitting(true);
    const res = await updateBuktiPembayaranHonorarium(
      riwayatPengajuanId,
      cuid,
      filenameBuktiPembayaran
    );
    if (res.success) {
      toast.success("Bukti pembayaran berhasil diupload");
    } else {
      toast.error(`Gagal mengupload bukti pembayaran ${res.message}`);
    }
    setIsSubmitting(false);
  };

  const handleUploadComplete = (name: string, file?: File | null) => {
    setIsUploaded(true);
    setFilenameBuktiPembayaran(file?.name ?? null);
    toast.success(`File ${name} berhasil diupload`);
  };
  return (
    <form>
      <div className="flex flex-col gap-2">
        <h1 className="mb-2 font-semibold text-l">Upload Bukti Pembayaran</h1>
        <InputFileImmediateUpload
          name="file"
          folder={riwayatPengajuanId}
          cuid={cuid}
          onFileUploadComplete={handleUploadComplete}
          onFileChange={() => setIsUploaded(false)}
          allowedTypes={[
            "application/pdf",
            "application/zip",
            "application/x-rar-compressed",
            "application/octet-stream", // Some browsers may use this for .rar files
          ]}
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
