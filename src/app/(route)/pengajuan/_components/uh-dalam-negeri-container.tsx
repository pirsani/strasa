"use client";

import { PesertaKegiatanDalamNegeri } from "@/actions/kegiatan/peserta/dalam-negeri";
import { ProsesPermissions } from "@/actions/pengguna/session";
import FloatingComponent from "@/components/floating-component";
import {
  DokumenKegiatan,
  RiwayatPengajuan,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";
import { useEffect, useState } from "react";
import TabelPesertaKegiatanDalamNegeri from "../../kegiatan/[...slug]/_components/tabel-peserta-uh-dalam-negeri";
import VerifikasiUhDalamNegeriContainer from "../uh-dalam-negeri/_components/verifikasi/verifikasi-uh-dalam-negeri-container";
import DataDukungUangHarianDalamNegeri from "./data-dukung-uh-dalam-negeri";
import DataDukungUangHarianDalamNegeriRevisi from "./data-dukung-uh-dalam-negeri-revisi";
import DataDukungUangHarianDalamNegeriView from "./data-dukung-uh-dalam-negeri-view";

interface UhDalamNegeriContainerProps {
  kegiatanId: string;
  riwayatPengajuan?: RiwayatPengajuan | null;
  dokumenKegiatan?: DokumenKegiatan[] | null;
  pesertaKegiatan?: PesertaKegiatanDalamNegeri[] | null;
  prosesPermissions?: ProsesPermissions;
}
const UhDalamNegeriContainer = ({
  kegiatanId,
  riwayatPengajuan,
  dokumenKegiatan,
  pesertaKegiatan,
  prosesPermissions,
}: UhDalamNegeriContainerProps) => {
  const [isPreviewHidden, setIsPreviewHidden] = useState(false);
  const [pesertaUpdated, setPesertaUpdated] = useState<
    PesertaKegiatanDalamNegeri[] | null
  >(null);
  const [statusPengajuan, setStatusPengajuan] =
    useState<STATUS_PENGAJUAN | null>(null);
  const handleDataChange = (data: PesertaKegiatanDalamNegeri[]) => {
    setPesertaUpdated(data);
  };

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
      return <DataDukungUangHarianDalamNegeri kegiatanId={kegiatanId} />;
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
              <DataDukungUangHarianDalamNegeriRevisi
                kegiatanId={kegiatanId}
                dokumenKegiatan={dokumenKegiatan}
              />
              <FloatingComponent
                hide={isPreviewHidden}
                onHide={() => setIsPreviewHidden(true)}
              >
                <div className="flex flex-col w-full">
                  <h1 className="bg-gray-500 text-gray-50 p-2 rounded-t-sm">
                    Peserta Kegiatan Dalam Negeri
                  </h1>
                  <TabelPesertaKegiatanDalamNegeri
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
            <VerifikasiUhDalamNegeriContainer
              kegiatanId={kegiatanId}
              dokumenKegiatan={dokumenKegiatan}
              pesertaKegiatan={pesertaKegiatan}
              updateStatus={setStatusPengajuan}
            />
          );
        }
        break;
      default:
        return (
          <>
            <DataDukungUangHarianDalamNegeriView
              dokumenKegiatan={dokumenKegiatan}
            />
            <FloatingComponent
              hide={isPreviewHidden}
              onHide={() => setIsPreviewHidden(true)}
            >
              <TabelPesertaKegiatanDalamNegeri data={pesertaKegiatan || []} />
            </FloatingComponent>
          </>
        );
    }

    // fallback to view mode
    return (
      <>
        <DataDukungUangHarianDalamNegeriView
          dokumenKegiatan={dokumenKegiatan}
        />
        <FloatingComponent
          hide={isPreviewHidden}
          onHide={() => setIsPreviewHidden(true)}
        >
          <TabelPesertaKegiatanDalamNegeri data={pesertaKegiatan || []} />
        </FloatingComponent>
      </>
    );
  } //end of else
};

export default UhDalamNegeriContainer;
