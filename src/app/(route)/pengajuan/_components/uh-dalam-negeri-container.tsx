"use client";

import { DokumenKegiatan, RiwayatPengajuan } from "@prisma-honorarium/client";
import DataDukungUangHarianDalamNegeri from "./data-dukung-uh-dalam-negeri";
import DataDukungUangHarianDalamNegeriRevisi from "./data-dukung-uh-dalam-negeri-revisi";
import DataDukungUangHarianDalamNegeriView from "./data-dukung-uh-dalam-negeri-view";

interface UhDalamNegeriContainerProps {
  kegiatanId: string;
  riwayatPengajuan?: RiwayatPengajuan | null;
  dokumenKegiatan?: DokumenKegiatan[] | null;
}
const UhDalamNegeriContainer = ({
  kegiatanId,
  riwayatPengajuan,
  dokumenKegiatan,
}: UhDalamNegeriContainerProps) => {
  if (!riwayatPengajuan) {
    //jika belum pernah melakukan pengajuan
    return <DataDukungUangHarianDalamNegeri kegiatanId={kegiatanId} />;
  } else {
    //jika sudah pernah melakukan pengajuan
    if (riwayatPengajuan.status === "REVISE") {
      //jika status pengajuan adalah revisi
      return (
        <DataDukungUangHarianDalamNegeriRevisi
          kegiatanId={kegiatanId}
          dokumenKegiatan={dokumenKegiatan}
        />
      );
    }
  }

  //default
  return (
    <DataDukungUangHarianDalamNegeriView dokumenKegiatan={dokumenKegiatan} />
  );
};

export default UhDalamNegeriContainer;
