import { KegiatanWithDetail } from "@/actions/kegiatan";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  JENIS_PENGAJUAN,
  LOKASI,
  LogProses,
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

// generate rampungan, uh dalam negeri, uh luar negeri hanya dapat di ajukan sekali
// honorarium, penggantian reimbursement, pembayaran pihak ke-3 dapat di ajukan berkali-kali
interface MapLogProses {
  [JENIS_PENGAJUAN.HONORARIUM]: LogProses[];
  [JENIS_PENGAJUAN.PENGGANTIAN_REINBURSEMENT]: LogProses[];
  [JENIS_PENGAJUAN.PEMBAYARAN_PIHAK_KETIGA]: LogProses[];
}

interface ButtonsPengajuanProps {
  jenisPengajuan: JENIS_PENGAJUAN | null;
  kegiatan: KegiatanWithDetail | null;
  logProses: LogProses[];
  handleSelection: (jenis: JENIS_PENGAJUAN) => void;
}

const ButtonsPengajuan = ({
  jenisPengajuan: initialJenisPengajuan,
  kegiatan: initialKegiatan,
  handleSelection,
  logProses,
}: ButtonsPengajuanProps) => {
  const [jenisPengajuan, setJenisPengajuan] = useState<JENIS_PENGAJUAN | null>(
    initialJenisPengajuan
  );
  const [kegiatan, setKegiatan] = useState<KegiatanWithDetail | null>(
    initialKegiatan
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setKegiatan(initialKegiatan);
  }, [initialKegiatan]);

  const [mapLogProses, setMapLogProses] = useState<MapLogProses | null>(null);

  const handleOnClick = (jenis: JENIS_PENGAJUAN) => {
    setJenisPengajuan(jenis);
    handleSelection(jenis);
    console.log("[logProses]", logProses);
  };

  const handleSuccessPengajuanRampungan = (kegiatan: KegiatanWithDetail) => {
    // update existing kegiatan
    setKegiatan(kegiatan);
  };

  useEffect(() => {
    console.log("[useEffect][logProses]", logProses);
    setMapLogProses(mappingLogProses(logProses));
  }, [logProses]);

  useEffect(() => {
    console.log("[useEffect][initialJenisPengajuan]", initialJenisPengajuan);
    setJenisPengajuan(initialJenisPengajuan);
  }, [initialJenisPengajuan]);

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

  return (
    <>
      <div className={cn("flex flex-wrap gap-2")}>
        {/* jika sudah ada generate rampungan, tidak bisa generate rampungan lagi */}
        <ButtonRiwayatRampungan
          statusRampungan={pengajuanRampungan?.status || null}
          jenisPengajuan={jenisPengajuan}
          handleOnClick={handleOnClick}
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
          <span className="hidden sm:block">Ajukan Honorarium</span>
        </Button>
        {kegiatan.lokasi != LOKASI.LUAR_NEGERI && (
          <ButtonAjukanUhDalamNegeri
            statusRampungan={pengajuanRampungan?.status || null}
            statusUhDalamNegeri={pengajuanUhDalamNegeri?.status || null}
            jenisPengajuan={jenisPengajuan}
            handleOnClick={handleOnClick}
          />
        )}
        {kegiatan.lokasi == LOKASI.LUAR_NEGERI && (
          <ButtonAjukanUhLuarNegeri
            statusRampungan={pengajuanRampungan?.status || null}
            statusUhLuarNegeri={pengajuanUhLuarNegeri?.status || null}
            jenisPengajuan={jenisPengajuan}
            handleOnClick={handleOnClick}
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
            Ajukan Penggantian/Reinbursement
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
          <span className="hidden sm:block">Ajukan Pembayaran Pihak Ke-3</span>
        </Button>
      </div>
    </>
  );
};

const mappingLogProses = (logProses: LogProses[]) => {
  const mapped: MapLogProses = {
    [JENIS_PENGAJUAN.HONORARIUM]: [],
    [JENIS_PENGAJUAN.PENGGANTIAN_REINBURSEMENT]: [],
    [JENIS_PENGAJUAN.PEMBAYARAN_PIHAK_KETIGA]: [],
  };

  logProses.forEach((proses) => {
    const jenis = proses.jenis;
  });
  console.log("[mapped]", mapped);
  return mapped;
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
  if (statusRampungan && statusRampungan !== "SUBMITTED") return null;

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
      <span className="hidden sm:block">Ajukan Generate Rampungan</span>
    </Button>
  );
};

interface ButtonAjukanUhDalamNegeriProps {
  handleOnClick: (jenis: JENIS_PENGAJUAN) => void;
  jenisPengajuan?: JENIS_PENGAJUAN | null;
  statusRampungan: STATUS_PENGAJUAN | null;
  statusUhDalamNegeri: STATUS_PENGAJUAN | null;
}
// button ini hanya untuk menampilkan button ajukan UH dalam negeri, , BUKAN pengajuan itu sendiri,
// setelah diklik akan mengubah state jenisPengajuan menjadi UH_DALAM_NEGERI
// akan ada komponen yang lain yang akan memunculkan formulir UH dalam negeri jika status jenisPengajuan adalah UH_DALAM_NEGERI
// sebenernya ini lebih tepat disebut sebagai menu, bukan button
const ButtonAjukanUhDalamNegeri = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
  statusUhDalamNegeri,
}: ButtonAjukanUhDalamNegeriProps) => {
  // jika belum ada generate rampungan, tidak bisa ajukan UH dalam negeri
  if (
    !statusRampungan ||
    (statusRampungan !== "VERIFIED" && statusRampungan !== "END")
  )
    return null;

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
      <span className="hidden sm:block">Ajukan UH Dalam Negeri</span>
    </Button>
  );
};

interface ButtonAjukanUhLuarNegeriProps {
  handleOnClick: (jenis: JENIS_PENGAJUAN) => void;
  jenisPengajuan?: JENIS_PENGAJUAN | null;
  statusRampungan: STATUS_PENGAJUAN | null;
  statusUhLuarNegeri: STATUS_PENGAJUAN | null;
}

const ButtonAjukanUhLuarNegeri = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
  statusUhLuarNegeri,
}: ButtonAjukanUhLuarNegeriProps) => {
  if (
    !statusRampungan ||
    (statusRampungan !== "VERIFIED" && statusRampungan !== "END")
  )
    return null;
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
      <span className="hidden sm:block">Ajukan UH Luar Negeri</span>
    </Button>
  );
};

export default ButtonsPengajuan;
