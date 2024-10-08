"use client";
import { getKegiatanById, KegiatanWithDetail } from "@/actions/kegiatan";
import FloatingComponent from "@/components/floating-component";
import PreviewKegiatan from "@/components/kegiatan";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import { JenisPengajuan } from "@/types";
import { RiwayatProses } from "@prisma-honorarium/client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { getRiwayatProses } from "@/actions/kegiatan/proses";
import useFileStore from "@/hooks/use-file-store";
import ButtonsPengajuan from "./buttons-pengajuan";
import { DisplayFormPengajuanGenerateRampungan } from "./honorarium/display-form-pengajuan-generate-rampungan";
import HonorariumContainer from "./honorarium/honorarium-container";
import PenggantianContainer from "./penggantian-container";
import PihakKe3Container from "./pihak-ke3-container";
import UhDalamNegeriContainer from "./uh-dalam-negeri-container";
import UhLuarNegeriContainer from "./uh-luar-negeri-container";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

const PengajuanContainer = () => {
  const [kegiatanId, setKegiatanId] = useState<string | null>(null);
  const [kegiatan, setKegiatan] = useState<KegiatanWithDetail | null>(null);
  const [riwayatProses, setRiwayatProses] = useState<RiwayatProses[]>([]);
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>(
    null
  );

  const { fileUrl, isPreviewHidden } = useFileStore();

  const handleSelection = (jenis: JenisPengajuan) => {
    setJenisPengajuan(jenis);
  };

  const handleKegiatanChange = (value: string | null) => {
    console.log(value);
    setJenisPengajuan(null);
    setKegiatanId(value); // after this set, it will trigger re-render PreviewKegiatan
  };

  const handleSuccessPengajuanRampungan = (
    kegiatanUpdated: KegiatanWithDetail
  ) => {
    setKegiatan((kegiatan) => ({
      ...kegiatan,
      ...kegiatanUpdated,
    }));
  };

  useEffect(() => {
    console.log("kegiatanId", kegiatanId);
    const getKegiatan = async () => {
      if (kegiatanId) {
        const data = await getKegiatanById(kegiatanId);
        const riwayat = await getRiwayatProses(kegiatanId);
        setKegiatan(data);
        setRiwayatProses(riwayat);
      }
    };
    getKegiatan();
  }, [kegiatanId]);

  const handleOnHide = () => {
    useFileStore.setState({ isPreviewHidden: true });
  };

  useEffect(() => {
    useFileStore.setState({ isPreviewHidden: true });
  }, []);

  return (
    <>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-20 bg-gray-100 rounded-lg py-4 lg:px-4">
        <div className="w-full flex flex-col gap-2 ">
          <SelectKegiatan
            inputId="kegiatan"
            onChange={handleKegiatanChange}
            className="w-full"
          />
          <div className="flex flex-row gap-2 w-full border-gray-300 border rounded-md p-2 shadow-lg">
            <PreviewKegiatan kegiatan={kegiatan} className="w-full" />
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 ">
          <ButtonsPengajuan
            jenisPengajuan={jenisPengajuan}
            handleSelection={handleSelection}
            kegiatan={kegiatan}
            riwayatProses={riwayatProses}
          />

          <span>{jenisPengajuan}</span>

          <DisplayFormPengajuanGenerateRampungan
            jenisPengajuan={jenisPengajuan}
            kegiatan={kegiatan}
            handleSuccess={handleSuccessPengajuanRampungan}
          />

          {jenisPengajuan == "HONORARIUM" && kegiatan && (
            <HonorariumContainer kegiatan={kegiatan} />
          )}

          {/* 
        TODO: jika sudah diajukan maka tampilkan form pengajuan view only
        tidak bisa update dokumen sampai pengajuan di minta untuk revisi dengan status revisi di kolom statusUhDalamNegeri
         */}
          {jenisPengajuan == "UH_DALAM_NEGERI" && kegiatan && (
            <UhDalamNegeriContainer kegiatanId={kegiatan.id} />
          )}
          {jenisPengajuan == "UH_LUAR_NEGERI" && kegiatan && (
            <UhLuarNegeriContainer kegiatanId={kegiatan.id} />
          )}
          {jenisPengajuan == "PENGGANTIAN_REINBURSEMENT" && (
            <PenggantianContainer />
          )}
          {jenisPengajuan == "PEMBAYARAN_PIHAK_KETIGA" && <PihakKe3Container />}
        </div>
      </div>
      <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </>
  );
};

export default PengajuanContainer;
