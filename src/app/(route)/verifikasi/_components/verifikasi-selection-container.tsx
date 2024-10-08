import { KegiatanWithDetail } from "@/actions/kegiatan";
import DaftarJadwal from "@/components/kegiatan/honorarium/daftar-jadwal";
import { JenisPengajuan } from "@/types";
import { useEffect, useState } from "react";
import ButtonsVerifikasi from "./buttons-verifikasi";
import FormGenerateRampungan from "./rampungan/form-generate-rampungan";
import UangHarianDalamNegeriContainer from "./uang-harian/dalam-negeri-container";

interface VerfikasiSelectionContainerProps {
  kegiatan: KegiatanWithDetail | null;
}

const VerfikasiSelectionContainer = ({
  kegiatan: initialKegiatan,
}: VerfikasiSelectionContainerProps) => {
  const [kegiatan, setKegiatan] = useState<KegiatanWithDetail | null>(
    initialKegiatan
  );
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>(
    null
  );
  const handleSelection = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
  };

  const handleSelesaiRampungan = (kegiatanUpdated: KegiatanWithDetail) => {
    setKegiatan((kegiatan) => ({
      ...kegiatan,
      ...kegiatanUpdated,
    }));
  };

  useEffect(() => {
    setJenisPengajuan(null);
  }, [kegiatan]);

  useEffect(() => {
    setKegiatan(initialKegiatan);
  }, [initialKegiatan]);

  return (
    kegiatan && (
      <div className="w-full flex flex-col gap-2 ">
        <ButtonsVerifikasi
          kegiatan={kegiatan}
          jenisPengajuan={jenisPengajuan}
          handleSelection={handleSelection}
          className="w-full"
        />
        <div className="flex flex-col gap-2 mt-6 w-full border-gray-300 border rounded-md p-2 shadow-lg">
          {jenisPengajuan == "GENERATE_RAMPUNGAN" && (
            <FormGenerateRampungan
              kegiatanId={kegiatan.id}
              handleSelesai={handleSelesaiRampungan}
            />
          )}
          {jenisPengajuan == "HONORARIUM" && (
            <DaftarJadwal kegiatanId={kegiatan.id} proses="verfikasi" />
          )}
          {jenisPengajuan == "UH_DALAM_NEGERI" && (
            <UangHarianDalamNegeriContainer kegiatan={kegiatan} />
          )}
          {jenisPengajuan == "UH_LUAR_NEGERI" && (
            <div>Verifikasi UH Luar Negeri</div>
          )}
          {jenisPengajuan == "PENGGANTIAN_REINBURSEMENT" && (
            <div>Verifikasi Penggantian Reinbursement</div>
          )}
          {jenisPengajuan == "PEMBAYARAN_PIHAK_KETIGA" && (
            <div>Verifikasi Pembayaran Pihak Ke-3</div>
          )}
        </div>
      </div>
    )
  );
};

export default VerfikasiSelectionContainer;
