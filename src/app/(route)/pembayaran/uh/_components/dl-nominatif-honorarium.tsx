"use client";
import ButtonEye from "@/components/button-eye-open-document";
import { ObjPlainJadwalKelasNarasumber } from "@/data/jadwal";
import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";
interface DlNominatifHonorariumProps {
  status: STATUS_PENGAJUAN | null;
  jadwal: ObjPlainJadwalKelasNarasumber;
}
const DlNominatifHonorarium = ({
  status,
  jadwal,
}: DlNominatifHonorariumProps) => {
  const hasNominatifHonorarium =
    status === STATUS_PENGAJUAN.REQUEST_TO_PAY ||
    status === STATUS_PENGAJUAN.PAID;

  if (!hasNominatifHonorarium) {
    return null;
  }
  return (
    <div className="flex flex-row w-full border-t border-gray-300 p-2 pl-0">
      <div className="px-4 py-2 w-full">Nominatif Honorarium</div>
      <ButtonEye
        url={`/download/nominatif-honorarium/${jadwal.kegiatanId}/${jadwal.id}`}
      />
    </div>
  );
};

export default DlNominatifHonorarium;
