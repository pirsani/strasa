import FormGenerateRampungan from "@/app/(route)/verifikasi/_components/rampungan/form-generate-rampungan";
import FloatingPdfPreviewContainer from "@/components/floating-pdf-preview-container";
import PreviewKegiatan from "@/components/kegiatan";
import { getKegiatanWithAllDetailById } from "@/data/kegiatan";
import { getRiwayatPengajuanById } from "@/data/kegiatan/riwayat-pengajuan";
import PesertaKegiatanDetailContainer from "./_components/peserta-kegiatan-detail-container";

export default async function RampunganDetilPage({
  params,
}: {
  params: Promise<{ pengajuanId: string }>;
}) {
  const pengajuanId = (await params).pengajuanId;
  const pengajuan = await getRiwayatPengajuanById(pengajuanId);
  if (!pengajuan) return null;

  //const kegiatan = await getKegiatanById(pengajuan?.kegiatanId);
  const kegiatan = await getKegiatanWithAllDetailById(pengajuan?.kegiatanId);
  if (!kegiatan) return null;

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300 gap-2">
      <h1 className="mb-2">Pengajuan Rampungan</h1>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <div className="w-full flex flex-col gap-2 ">
          <div className="flex flex-row gap-2 w-full border-gray-300 border rounded-md p-2 shadow-lg">
            <PreviewKegiatan kegiatan={kegiatan} className="w-full" />
          </div>
        </div>
      </div>
      <PesertaKegiatanDetailContainer
        kegiatan={kegiatan}
        className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-20 bg-gray-100 rounded-lg py-4 lg:px-4 p-2"
      />
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-20 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <FormGenerateRampungan kegiatan={kegiatan} />
      </div>
      <FloatingPdfPreviewContainer />
    </div>
  );
}
