"use client";

import { PesertaKegiatanLuarNegeri } from "@/actions/kegiatan/peserta/luar-negeri";
import { ProsesPermissions } from "@/actions/pengguna/session";
import FloatingComponent from "@/components/floating-component";
import {
  DokumenKegiatan,
  RiwayatPengajuan,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
import { useEffect, useState } from "react";
import TabelPesertaKegiatanLuarNegeri from "../../kegiatan/[...slug]/_components/tabel-peserta-uh-luar-negeri";
import VerifikasiUhLuarNegeriContainer from "../uh-luar-negeri/_components/verifikasi/verifikasi-uh-luar-negeri-container";
import DataDukungUangHarianLuarNegeri from "./data-dukung-uh-luar-negeri";
import DataDukungUangHarianLuarNegeriRevisi from "./data-dukung-uh-luar-negeri-revisi";
import DataDukungUangHarianLuarNegeriView from "./data-dukung-uh-luar-negeri-view";

interface UhLuarNegeriContainerProps {
  kegiatanId: string;
  riwayatPengajuan?: RiwayatPengajuan | null;
  dokumenKegiatan?: DokumenKegiatan[] | null;
  pesertaKegiatan?: PesertaKegiatanLuarNegeri[] | null;
  prosesPermissions?: ProsesPermissions;
}
const UhLuarNegeriContainer = ({
  kegiatanId,
  riwayatPengajuan,
  dokumenKegiatan,
  pesertaKegiatan,
  prosesPermissions,
}: UhLuarNegeriContainerProps) => {
  const [isPreviewHidden, setIsPreviewHidden] = useState(false);

  const [statusPengajuan, setStatusPengajuan] =
    useState<STATUS_PENGAJUAN | null>(null);

  useEffect(() => {
    if (riwayatPengajuan) {
      setStatusPengajuan(riwayatPengajuan.status);
    }
  }, [riwayatPengajuan]);

  if (!riwayatPengajuan) {
    //jika belum pernah melakukan pengajuan
    if (
      prosesPermissions?.createAnyProsesPengajuan ||
      prosesPermissions?.createOwnProsesPengajuan
    ) {
      return <DataDukungUangHarianLuarNegeri kegiatanId={kegiatanId} />;
    }
  } else {
    switch (statusPengajuan) {
      case "REVISE":
        if (
          prosesPermissions?.createAnyProsesPengajuan ||
          prosesPermissions?.createOwnProsesPengajuan
        ) {
          return (
            <>
              <DataDukungUangHarianLuarNegeriRevisi
                kegiatanId={kegiatanId}
                dokumenKegiatan={dokumenKegiatan}
              />
              <FloatingComponent
                hide={isPreviewHidden}
                onHide={() => setIsPreviewHidden(true)}
              >
                <div className="flex flex-col w-full">
                  <h1 className="bg-gray-500 text-gray-50 p-2 rounded-t-sm">
                    Peserta Kegiatan Luar Negeri
                  </h1>
                  <TabelPesertaKegiatanLuarNegeri
                    data={pesertaKegiatan || []}
                  />
                </div>
              </FloatingComponent>
            </>
          );
        }
        break;
      case "SUBMITTED":
      case "REVISED":
        if (
          prosesPermissions?.createAnyProsesVerifikasi ||
          prosesPermissions?.createOwnProsesVerifikasi
        ) {
          return (
            <VerifikasiUhLuarNegeriContainer
              kegiatanId={kegiatanId}
              dokumenKegiatan={dokumenKegiatan}
              pesertaKegiatan={pesertaKegiatan}
              updateStatus={setStatusPengajuan}
            />
          );
        }
        break;
      default:
        break;
    }
  }

  // fallback to view mode
  return (
    <>
      <DataDukungUangHarianLuarNegeriView dokumenKegiatan={dokumenKegiatan} />
      <FloatingComponent
        hide={isPreviewHidden}
        onHide={() => setIsPreviewHidden(true)}
      >
        <div className="flex flex-col w-full">
          <h1 className="bg-gray-500 text-gray-50 p-2 rounded-t-sm">
            Peserta Kegiatan Luar Negeri
          </h1>
          <TabelPesertaKegiatanLuarNegeri data={pesertaKegiatan || []} />
        </div>
      </FloatingComponent>
    </>
  );
};

export default UhLuarNegeriContainer;
