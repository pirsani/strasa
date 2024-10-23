import { KegiatanWithDetail } from "@/actions/kegiatan";
import { Button } from "@/components/ui/button";
//import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  JENIS_PENGAJUAN,
  LOKASI,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
import {
  Coins,
  FileStack,
  Globe,
  HandCoins,
  MapPinned,
  PlaneTakeoff,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ButtonsVerifikasiProps {
  handleSelection: (jenis: JENIS_PENGAJUAN) => void;
  kegiatan: KegiatanWithDetail | null;
  jenisPengajuan: JENIS_PENGAJUAN | null;
  className?: string;
}

const ButtonsVerifikasi = ({
  handleSelection,
  kegiatan: initialKegiatan,
  jenisPengajuan,
  className,
}: ButtonsVerifikasiProps) => {
  const [kegiatan, setKegiatan] = useState<KegiatanWithDetail | null>(
    initialKegiatan
  );

  const handleOnClick = (jenis: JENIS_PENGAJUAN) => {
    handleSelection(jenis);
  };

  useEffect(() => {
    setKegiatan(initialKegiatan);
  }, [initialKegiatan]);

  if (!kegiatan) return null;

  // Check if there's an existing pengajuan rampungan
  const pengajuanRampungan = kegiatan.riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "GENERATE_RAMPUNGAN"
  );
  const pengajuanUhDalamNegeri = kegiatan.riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "UH_DALAM_NEGERI"
  );
  const pengajuanUhLuarNegeri = kegiatan.riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "UH_LUAR_NEGERI"
  );

  const pengajuanHonorarium = kegiatan.riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "HONORARIUM"
  );

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <ButtonRiwayatRampungan
        handleOnClick={() => handleOnClick("GENERATE_RAMPUNGAN")}
        jenisPengajuan={jenisPengajuan}
        statusRampungan={pengajuanRampungan?.status || null}
      />
      <Button
        variant="outline"
        onClick={() => handleOnClick("HONORARIUM")}
        className={cn(
          "hover:bg-blue-400 hover:text-white gap-2",
          jenisPengajuan == "HONORARIUM" && "bg-blue-500 text-white"
        )}
      >
        <HandCoins size={24} />
        <span className="hidden sm:block">Verifikasi Honorarium</span>
      </Button>
      {kegiatan.lokasi != LOKASI.LUAR_NEGERI && (
        <ButtonVerifikasiUhDalamNegeri
          handleOnClick={() => handleOnClick("UH_DALAM_NEGERI")}
          jenisPengajuan={jenisPengajuan}
          statusRampungan={pengajuanRampungan?.status || null}
          statusUhDalamNegeri={pengajuanUhDalamNegeri?.status || null}
        />
      )}
      {kegiatan.lokasi == LOKASI.LUAR_NEGERI && (
        <ButtonVerifikasiUhLuarNegeri
          handleOnClick={() => handleOnClick("UH_LUAR_NEGERI")}
          jenisPengajuan={jenisPengajuan}
          statusRampungan={pengajuanRampungan?.status || null}
          statusUhLuarNegeri={pengajuanUhLuarNegeri?.status || null}
        />
      )}

      <Button
        variant="outline"
        onClick={() => handleOnClick("PENGGANTIAN_REINBURSEMENT")}
        className={cn(
          "hidden",
          "hover:bg-blue-400 hover:text-white gap-2",
          jenisPengajuan == "PENGGANTIAN_REINBURSEMENT" &&
            "bg-blue-500 text-white"
        )}
      >
        <Coins size={24} />
        <span className="hidden sm:block">
          Verifikasi Penggantian/Reinbursement
        </span>
      </Button>
      <Button
        variant="outline"
        onClick={() => handleOnClick("PEMBAYARAN_PIHAK_KETIGA")}
        className={cn(
          "hidden",
          "hover:bg-blue-400 hover:text-white gap-2",
          jenisPengajuan == "PEMBAYARAN_PIHAK_KETIGA" &&
            "bg-blue-500 text-white"
        )}
      >
        <Store size={24} />
        <span className="hidden sm:block">
          Verifikasi Pembayaran Pihak Ke-3
        </span>
      </Button>
    </div>
  );
};

interface ButtonRiwayatRampunganProps {
  handleOnClick: (jenis: JENIS_PENGAJUAN) => void;
  jenisPengajuan?: JENIS_PENGAJUAN | null;
  statusRampungan: STATUS_PENGAJUAN | null;
}
const ButtonRiwayatRampungan = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
}: ButtonRiwayatRampunganProps) => {
  if (!statusRampungan || statusRampungan === STATUS_PENGAJUAN.END) return null;

  return (
    <Button
      variant="outline"
      onClick={() => handleOnClick("GENERATE_RAMPUNGAN")}
      className={cn(
        "hover:bg-blue-400 hover:text-white gap-2",
        jenisPengajuan == "GENERATE_RAMPUNGAN" && "bg-blue-500 text-white"
      )}
    >
      <FileStack size={24} />
      <span className="hidden sm:block">Verifikasi Generate Rampungan</span>
    </Button>
  );
};

interface ButtonVerifikasiUhDalamNegeriProps {
  handleOnClick: (jenis: JENIS_PENGAJUAN) => void;
  jenisPengajuan?: JENIS_PENGAJUAN | null;
  statusRampungan: STATUS_PENGAJUAN | null;
  statusUhDalamNegeri: STATUS_PENGAJUAN | null;
}

const ButtonVerifikasiUhDalamNegeri = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
  statusUhDalamNegeri,
}: ButtonVerifikasiUhDalamNegeriProps) => {
  //jika status rampungan belum ada atau selesai, maka button tidak muncul
  if (
    !statusRampungan ||
    (statusRampungan !== STATUS_PENGAJUAN.VERIFIED &&
      statusRampungan !== STATUS_PENGAJUAN.END)
  )
    return null;
  //jika status UH dalam negeri bukan pengajuan, maka button tidak muncul
  if (!statusUhDalamNegeri || statusUhDalamNegeri !== "SUBMITTED") return null;

  return (
    <Button
      variant="outline"
      onClick={() => handleOnClick("UH_DALAM_NEGERI")}
      className={cn(
        "hover:bg-blue-400 hover:text-white gap-2",
        jenisPengajuan == "UH_DALAM_NEGERI" && "bg-blue-500 text-white"
      )}
    >
      <div className="flex items-center space-x-1">
        <MapPinned size={24} />
        <PlaneTakeoff size={24} />
      </div>
      <span className="hidden sm:block">Verifikasi UH Dalam Negeri</span>
    </Button>
  );
};

interface ButtonVerifikasiUhLuarNegeriProps {
  handleOnClick: (jenis: JENIS_PENGAJUAN) => void;
  jenisPengajuan?: JENIS_PENGAJUAN | null;
  statusRampungan: STATUS_PENGAJUAN | null;
  statusUhLuarNegeri: STATUS_PENGAJUAN | null;
}

const ButtonVerifikasiUhLuarNegeri = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
  statusUhLuarNegeri,
}: ButtonVerifikasiUhLuarNegeriProps) => {
  //jika status rampungan belum ada atau selesai, maka button tidak muncul
  if (
    !statusRampungan ||
    (statusRampungan !== "VERIFIED" && statusRampungan !== "END")
  )
    return null;

  //jika status UH dalam negeri bukan pengajuan, maka button tidak muncul
  if (!statusUhLuarNegeri || statusUhLuarNegeri !== "SUBMITTED") return null;

  return (
    <Button
      variant="outline"
      onClick={() => handleOnClick("UH_LUAR_NEGERI")}
      className={cn(
        "hover:bg-blue-400 hover:text-white gap-2",
        jenisPengajuan == "UH_LUAR_NEGERI" && "bg-blue-500 text-white"
      )}
    >
      <div className="flex items-center space-x-1">
        <Globe size={24} />
        <PlaneTakeoff size={24} />
      </div>
      <span className="hidden sm:block">Verifikasi UH Luar Negeri</span>
    </Button>
  );
};

export default ButtonsVerifikasi;
