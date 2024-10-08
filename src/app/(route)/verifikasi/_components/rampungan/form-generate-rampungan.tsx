"use client";
import { KegiatanWithDetail } from "@/actions/kegiatan";
import { updateStatusRampungan } from "@/actions/kegiatan/proses";
import { Button } from "@/components/ui/button";

interface FormGenerateRampunganProps {
  kegiatanId: string;
  handleSelesai?: (kegiatan: KegiatanWithDetail) => void;
  handleGenerate?: () => void;
}
const FormGenerateRampungan = ({
  kegiatanId,
  handleGenerate = () => {},
  handleSelesai = () => {},
}: FormGenerateRampunganProps) => {
  const handleClickSelesai = async () => {
    const updateStatus = await updateStatusRampungan(kegiatanId, "selesai");
    if (updateStatus.success) {
      handleSelesai(updateStatus.data);
      console.log("[updateStatus]", updateStatus);
    }
  };

  const handleClickGenerate = async () => {
    // const updateStatus = await updateStatusRampungan(kegiatanId, "selesai");
    // if (updateStatus.success) {
    //   handleSelesai(updateStatus.data);
    //   console.log("[updateStatus]", updateStatus);
    // }
    window.open(`/download/dokumen-rampungan/${kegiatanId}`, "_blank"); // Open new window
  };
  return (
    <div className="flex flex-col w-full sm:w-1/2 ">
      <div className="flex flex-row gap-4 w-full">
        <Button
          type="button"
          className="grow bg-blue-600 hover:bg-blue-700"
          onClick={handleClickGenerate}
        >
          Generate Rampungan
        </Button>
        <Button
          type="button"
          variant={"destructive"}
          onClick={handleClickSelesai}
        >
          Selesai
        </Button>
      </div>
    </div>
  );
};

export default FormGenerateRampungan;
