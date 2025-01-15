import FloatingPdfPreviewContainer from "@/components/floating-pdf-preview-container";
import PreviewKegiatan from "@/components/kegiatan";
import { getKegiatanWithAllDetailById } from "@/data/kegiatan";
import { getRiwayatPengajuanById } from "@/data/kegiatan/riwayat-pengajuan";
import ContainerPembayaran from "../../_components/container-pembayaran";

const PembayaranUhPage = async ({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) => {
  const slug = (await params).slug;
  const kegiatanId = slug[0];
  const riwayatPengajuanId = slug[1];
  const kegiatan = await getKegiatanWithAllDetailById(kegiatanId);
  const riwayatPengajuan = await getRiwayatPengajuanById(riwayatPengajuanId);

  if (!riwayatPengajuan || !riwayatPengajuan.kegiatan || !kegiatan) {
    return <div>Not found</div>;
  }

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300 gap-2">
      <h1 className="mb-2 bg-gray-500 text-gray-50 p-2 ">
        Pembayaran Uang Harian : <span>{kegiatan?.nama}</span>
      </h1>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-4 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <PreviewKegiatan kegiatan={kegiatan} />
      </div>

      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-4 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <ContainerPembayaran
          riwayatPengajuanId={riwayatPengajuanId}
          statusPengajuan={riwayatPengajuan.status}
          jenisPengajuan={riwayatPengajuan.jenis}
        />
      </div>
      <FloatingPdfPreviewContainer />
    </div>
  );
};

export default PembayaranUhPage;
