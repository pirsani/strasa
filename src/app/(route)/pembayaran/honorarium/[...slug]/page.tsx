import FloatingPdfPreviewContainer from "@/components/floating-pdf-preview-container";
import PreviewKegiatan from "@/components/kegiatan";
import { getJadwalById } from "@/data/jadwal";
import { getKegiatanWithAllDetailById } from "@/data/kegiatan";
import FormPembayaran from "../_components/form-pembayaran";
import Jadwal from "../_components/jadwal";

const PembayaranHonorariumPage = async ({
  params,
}: {
  params: { slug: string[] };
}) => {
  const kegiatanId = params.slug[0];
  const jadwalId = params.slug[1];
  const kegiatan = await getKegiatanWithAllDetailById(kegiatanId);
  const jadwal = await getJadwalById(jadwalId);

  if (!kegiatan || !jadwal || !jadwal.riwayatPengajuanId) {
    return <div>Not found</div>;
  }

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300 gap-2">
      <h1 className="mb-2 bg-gray-500 text-gray-50 p-2 ">
        Pembayaran Honorarium : <span>{kegiatan?.nama}</span>
      </h1>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-4 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <PreviewKegiatan kegiatan={kegiatan} />
      </div>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-4 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <Jadwal jadwal={jadwal} proses={"PEMBAYARAN"} />
      </div>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-4 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <FormPembayaran riwayatPengajuanId={jadwal.riwayatPengajuanId} />
      </div>
      <FloatingPdfPreviewContainer />
    </div>
  );
};

export default PembayaranHonorariumPage;
