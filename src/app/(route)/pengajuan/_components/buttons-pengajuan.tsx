import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { JenisPengajuan } from "@/types";
import {
  JENIS_PENGAJUAN,
  Kegiatan,
  LOKASI,
  RiwayatProses,
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
interface MapRiwayatProses {
  [JENIS_PENGAJUAN.HONORARIUM]: RiwayatProses[];
  [JENIS_PENGAJUAN.PENGGANTIAN_REINBURSEMENT]: RiwayatProses[];
  [JENIS_PENGAJUAN.PEMBAYARAN_PIHAK_KETIGA]: RiwayatProses[];
}

interface ButtonsPengajuanProps {
  jenisPengajuan: JenisPengajuan | null;
  kegiatan: Kegiatan | null;
  riwayatProses: RiwayatProses[];
  handleSelection: (jenis: JenisPengajuan) => void;
}

const ButtonsPengajuan = ({
  jenisPengajuan: initialJenisPengajuan,
  kegiatan: initialKegiatan,
  handleSelection,
  riwayatProses,
}: ButtonsPengajuanProps) => {
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>(
    initialJenisPengajuan
  );
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(initialKegiatan);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setKegiatan(initialKegiatan);
  }, [initialKegiatan]);

  const [mapRiwayatProses, setMapRiwayatProses] =
    useState<MapRiwayatProses | null>(null);

  const handleOnClick = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
    handleSelection(jenis);
    console.log("[riwayatProses]", riwayatProses);
  };

  const handleSuccessPengajuanRampungan = (kegiatan: Kegiatan) => {
    // update existing kegiatan
    setKegiatan(kegiatan);
  };

  useEffect(() => {
    console.log("[useEffect][riwayatProses]", riwayatProses);
    setMapRiwayatProses(mappingRiwayatProses(riwayatProses));
  }, [riwayatProses]);

  useEffect(() => {
    console.log("[useEffect][initialJenisPengajuan]", initialJenisPengajuan);
    setJenisPengajuan(initialJenisPengajuan);
  }, [initialJenisPengajuan]);

  if (!kegiatan) return null;

  return (
    <>
      <div className={cn("flex flex-wrap gap-2")}>
        {/* jika sudah ada generate rampungan, tidak bisa generate rampungan lagi */}
        <ButtonRiwayatRampungan
          statusRampungan={kegiatan.statusRampungan}
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
            statusRampungan={kegiatan.statusRampungan}
            statusUhDalamNegeri={kegiatan.statusUhDalamNegeri}
            jenisPengajuan={jenisPengajuan}
            handleOnClick={handleOnClick}
          />
        )}
        {kegiatan.lokasi == LOKASI.LUAR_NEGERI && (
          <ButtonAjukanUhLuarNegeri
            statusRampungan={kegiatan.statusRampungan}
            statusUhLuarNegeri={kegiatan.statusUhLuarNegeri}
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

const mappingRiwayatProses = (riwayatProses: RiwayatProses[]) => {
  const mapped: MapRiwayatProses = {
    [JENIS_PENGAJUAN.HONORARIUM]: [],
    [JENIS_PENGAJUAN.PENGGANTIAN_REINBURSEMENT]: [],
    [JENIS_PENGAJUAN.PEMBAYARAN_PIHAK_KETIGA]: [],
  };

  riwayatProses.forEach((proses) => {
    const jenis = proses.jenis;
  });
  console.log("[mapped]", mapped);
  return mapped;
};

interface ButtonRiwayatRampunganProps {
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan?: JenisPengajuan | null;
  statusRampungan: string | null;
}
const ButtonRiwayatRampungan = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
}: ButtonRiwayatRampunganProps) => {
  if (statusRampungan && statusRampungan !== "pengajuan") return null;

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
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan?: JenisPengajuan | null;
  statusRampungan: string | null;
  statusUhDalamNegeri: string | null;
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
    (statusRampungan !== "terverifikasi" && statusRampungan !== "selesai")
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
  handleOnClick: (jenis: JenisPengajuan) => void;
  jenisPengajuan?: JenisPengajuan | null;
  statusRampungan: string | null;
  statusUhLuarNegeri: string | null;
}

const ButtonAjukanUhLuarNegeri = ({
  handleOnClick,
  jenisPengajuan,
  statusRampungan,
  statusUhLuarNegeri,
}: ButtonAjukanUhLuarNegeriProps) => {
  if (
    !statusRampungan ||
    (statusRampungan !== "terverifikasi" && statusRampungan !== "selesai")
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
