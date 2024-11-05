"use client";

import { DokumenKegiatan, RiwayatPengajuan } from "@prisma-honorarium/client";
import DataDukungUangHarianLuarNegeri from "./data-dukung-uh-luar-negeri";
import DataDukungUangHarianLuarNegeriRevisi from "./data-dukung-uh-luar-negeri-revisi";
import DataDukungUangHarianLuarNegeriView from "./data-dukung-uh-luar-negeri-view";

interface UhLuarNegeriContainerProps {
  kegiatanId: string;
  riwayatPengajuan?: RiwayatPengajuan | null;
  dokumenKegiatan?: DokumenKegiatan[] | null;
}
const UhLuarNegeriContainer = ({
  kegiatanId,
  riwayatPengajuan,
  dokumenKegiatan,
}: UhLuarNegeriContainerProps) => {
  if (!riwayatPengajuan) {
    //jika belum pernah melakukan pengajuan
    return <DataDukungUangHarianLuarNegeri kegiatanId={kegiatanId} />;
  } else {
    //jika sudah pernah melakukan pengajuan
    if (riwayatPengajuan.status === "REVISE") {
      //jika status pengajuan adalah revisi
      return (
        <DataDukungUangHarianLuarNegeriRevisi
          kegiatanId={kegiatanId}
          dokumenKegiatan={dokumenKegiatan}
        />
      );
    }
  }

  //default
  return (
    <DataDukungUangHarianLuarNegeriView dokumenKegiatan={dokumenKegiatan} />
  );
};

export default UhLuarNegeriContainer;
