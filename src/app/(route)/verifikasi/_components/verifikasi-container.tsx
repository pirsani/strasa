"use client";
import { getKegiatanById, KegiatanWithDetail } from "@/actions/kegiatan";
import FloatingComponent from "@/components/floating-component";
import PreviewKegiatan from "@/components/kegiatan";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import useFileStore from "@/hooks/use-file-store";
import { JenisPengajuan } from "@/types";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import VerfikasiSelectionContainer from "./verifikasi-selection-container";
const SelectKegiatan = dynamic(
  () => import("@/components/form/select-kegiatan"),
  { ssr: false, loading: () => <p>Loading daftar kegiatan...</p> }
);

const VerifikasiContainer = () => {
  const [kegiatanId, setKegiatanId] = useState<string | null>(null);
  const [kegiatan, setKegiatan] = useState<KegiatanWithDetail | null>(null);
  const { fileUrl, isPreviewHidden } = useFileStore();

  const handleKegiatanChange = (value: string | null) => {
    console.log(value);
    setKegiatanId(value); // after this set, it will trigger re-render PreviewKegiatan
  };
  const [jenisPengajuan, setJenisPengajuan] = useState<JenisPengajuan | null>();

  useEffect(() => {
    console.log("kegiatanId", kegiatanId);
    const getKegiatan = async () => {
      if (kegiatanId) {
        const data = await getKegiatanById(kegiatanId);
        setKegiatan(data);
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
          <VerfikasiSelectionContainer kegiatan={kegiatan} />
        </div>
      </div>
      <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </>
  );
};

export default VerifikasiContainer;
