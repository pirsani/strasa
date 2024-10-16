"use client";
import { getKegiatanById, KegiatanWithDetail } from "@/actions/kegiatan";
import FloatingComponent from "@/components/floating-component";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import { LogProses } from "@prisma-honorarium/client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { getLogProses } from "@/actions/kegiatan/proses";
import { JenisPengajuan } from "@/app/(route)/daftar-nominatif/_components/select-jenis-pengajuan";
import useFileStore from "@/hooks/use-file-store";
import FormNominatifHonorarium from "./form-nominatif-honorarium";

const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

const DaftarNominatifContainer = () => {
  const [kegiatanId, setKegiatanId] = useState<string | null>(null);
  const [kegiatan, setKegiatan] = useState<KegiatanWithDetail | null>(null);
  const [logProses, setLogProses] = useState<LogProses[]>([]);
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>(
    null
  );

  const { fileUrl, isPreviewHidden } = useFileStore();

  const handleKegiatanChange = (value: string | null) => {
    console.log(value);
    setKegiatanId(value); // after this set, it will trigger re-render PreviewKegiatan
  };

  useEffect(() => {
    console.log("kegiatanId", kegiatanId);
    const getKegiatan = async () => {
      if (kegiatanId) {
        const data = await getKegiatanById(kegiatanId);
        const riwayat = await getLogProses(kegiatanId);
        setKegiatan(data);
        setLogProses(riwayat);
      } else {
        setKegiatan(null);
        setLogProses([]);
      }
    };
    getKegiatan();
  }, [kegiatanId]);

  const handleOnHide = () => {
    useFileStore.setState({ isPreviewHidden: true });
  };

  const handleOnSuccess = (data: any) => {
    // reset kegiatanId to null
    setKegiatanId(null);
  };

  useEffect(() => {
    useFileStore.setState({ isPreviewHidden: true });
  }, []);

  return (
    <>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-20 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <div className="w-full flex flex-col gap-2 ">
          <SelectKegiatan
            proses={"nominatif"}
            inputId="kegiatan"
            onChange={handleKegiatanChange}
            className="w-full"
            value={kegiatanId ?? ""}
          />
        </div>
        <div>
          {kegiatan && (
            <FormNominatifHonorarium
              kegiatan={kegiatan}
              onSuccess={handleOnSuccess}
            />
          )}
        </div>
      </div>
      <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </>
  );
};

export default DaftarNominatifContainer;
