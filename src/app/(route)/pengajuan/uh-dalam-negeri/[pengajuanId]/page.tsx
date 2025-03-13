import { getKegiatanById } from "@/actions/kegiatan";
import getPesertaKegiatanDalamNegeri from "@/actions/kegiatan/peserta/dalam-negeri";
import {
  getLoggedInPengguna,
  getProsesPermissions,
} from "@/actions/pengguna/session";
import FloatingPdfPreviewContainer from "@/components/floating-pdf-preview-container";
import PreviewKegiatan from "@/components/kegiatan";
import { getRiwayatPengajuanById } from "@/data/kegiatan/riwayat-pengajuan";
import UhDalamNegeriContainer from "../../_components/uh-dalam-negeri-container";

export default async function UhDalamNegeriDetilPage({
  params,
}: {
  params: Promise<{ pengajuanId: string }>;
}) {
  const pengajuanId = (await params).pengajuanId;

  const pengajuan = await getRiwayatPengajuanById(pengajuanId);
  console.log(pengajuan);

  if (!pengajuan || !pengajuan.kegiatan)
    return <div>Data pengajuan tidak ditemukan</div>;

  const jenisPengajuan = pengajuan.jenis;

  const kegiatan = await getKegiatanById(pengajuan.kegiatan.id);

  if (!kegiatan) return <div>Data kegiatan tidak ditemukan</div>;

  const peserta = await getPesertaKegiatanDalamNegeri(kegiatan.id);
  if (!peserta.success) return <div>Data peserta tidak ditemukan</div>;

  const pesertaKegiatan = peserta.data;

  const pengguna = await getLoggedInPengguna();

  if (!pengguna) {
    return <div>Anda tidak memiliki akses ke halaman ini</div>;
  }

  const prosesPermissions = await getProsesPermissions();

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300 gap-4">
      <div className="flex flex-row gap-2 w-full md:w-1/2 border-gray-300 bg-gray-50 border rounded-md p-2 shadow-lg">
        <PreviewKegiatan kegiatan={kegiatan} className="w-full" />
      </div>
      {jenisPengajuan == "UH_DALAM_NEGERI" && (
        <>
          <div className="flex flex-row gap-2 w-full md:w-1/2 border-gray-300 bg-gray-50 border rounded-md p-2 shadow-lg">
            {jenisPengajuan == "UH_DALAM_NEGERI" && kegiatan && (
              <UhDalamNegeriContainer
                kegiatanId={kegiatan.id}
                riwayatPengajuan={pengajuan}
                dokumenKegiatan={kegiatan.dokumenKegiatan}
                pesertaKegiatan={pesertaKegiatan || []}
                prosesPermissions={prosesPermissions}
              />
            )}
          </div>
        </>
      )}

      <FloatingPdfPreviewContainer />
    </div>
  );
}
