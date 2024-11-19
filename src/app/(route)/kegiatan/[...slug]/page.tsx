import { getSessionPenggunaForAction } from "@/actions/pengguna";
import PreviewKegiatan from "@/components/kegiatan";
import { getKegiatanWithAllDetailById } from "@/data/kegiatan";
import KegiatanDetailContainer from "./_components/kegiatan-detail-container";

const Kegiatan = async ({ params }: { params: { slug: string[] } }) => {
  const kegiatanId = params.slug[0];
  const kegiatan = await getKegiatanWithAllDetailById(kegiatanId);
  let isAllowEdit = false;

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    // it should never happen because it already checked in middleware
    return null;
  }
  // TODO memastikan bahwa pengguna yang mengajukan adalah satker pengguna yang terkait dengan kegiatan
  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const penggunaName = pengguna.data.penggunaName;

  const riwayatPengajuan = kegiatan?.riwayatPengajuan;
  if (riwayatPengajuan) {
    const allowedStatuses = ["DRAFT", "SUBMITTED", "REVISE", "REVISED"];
    // find if there is a riwayat pengajuan with status other than DRAFT, SUBMITTED, REVISE, REVISED
    isAllowEdit =
      riwayatPengajuan.length === 0 ||
      riwayatPengajuan.every((item) => allowedStatuses.includes(item.status));
  }

  isAllowEdit = isAllowEdit && kegiatan?.createdBy === penggunaId;

  console.log("isAllowEdit", isAllowEdit);

  if (!kegiatan) {
    return <div>Not found</div>;
  }

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300 gap-2">
      <h1 className="mb-2 bg-gray-500 text-gray-50 p-2 ">
        Kegiatan : <span>{kegiatan?.nama}</span>
      </h1>
      <div className="relative flex flex-col w-full lg:w-1/2 gap-6 pb-20 bg-gray-100 rounded-lg py-4 lg:px-4 p-2">
        <PreviewKegiatan kegiatan={kegiatan} isAllowEdit={isAllowEdit} />
      </div>
      <KegiatanDetailContainer kegiatan={kegiatan} />
    </div>
  );
};

export default Kegiatan;
